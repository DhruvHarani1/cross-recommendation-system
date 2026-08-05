from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import User, UserInteraction, ContentEmbedding
from services.personalization_service import (
    onboard_user,
    get_user_profile,
    record_feedback,
    get_personalized_recommendations,
    get_experience_bundle,
    INTERACTION_WEIGHTS,
    compute_taste_vector,
    get_tag_preferences
)
from services.recommendation_service import resolve_metadata
from datetime import datetime, timezone

router = APIRouter(tags=["Personalization & Users"])

VALID_TYPES = {"movie", "song", "game", "book"}
VALID_INTERACTIONS = {"like", "superlike", "dislike"}


# ── Request Bodies ────────────────────────────────────────────────────────────

class AnchorItem(BaseModel):
    content_id: str
    content_type: str

class OnboardRequest(BaseModel):
    user_id: str
    display_name: str = None
    anchors: List[AnchorItem]

class FeedbackRequest(BaseModel):
    content_id: str
    content_type: str
    interaction_type: str  # like, superlike, dislike

class OnboardPreferencesRequest(BaseModel):
    favorite_types: List[str]  # e.g. ["movie", "game"]
    keywords: List[str] = []   # e.g. ["sci-fi", "dark fantasy"]
    anchors: List[AnchorItem] = []  # picked favorite items


# ── User Endpoints ────────────────────────────────────────────────────────────

@router.post("/users/onboard")
def onboard(request: OnboardRequest, db: Session = Depends(get_db)):
    """Seed a user's taste profile with 3-10 anchor items from any domain.
    Creates the user if they don't exist yet."""
    if len(request.anchors) < 1:
        raise HTTPException(status_code=422, detail="Provide at least 1 anchor item.")
    if len(request.anchors) > 15:
        raise HTTPException(status_code=422, detail="Maximum 15 anchor items allowed.")

    for a in request.anchors:
        if a.content_type not in VALID_TYPES:
            raise HTTPException(status_code=422, detail=f"Invalid content_type: '{a.content_type}'")

    result = onboard_user(
        db,
        user_id=request.user_id,
        display_name=request.display_name,
        anchors=[a.model_dump() for a in request.anchors]
    )
    return result


@router.get("/users/{user_id}/profile")
def user_profile(user_id: str, db: Session = Depends(get_db)):
    """View a user's profile, liked items, and top taste tags."""
    profile = get_user_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")
    return profile


@router.post("/users/feedback")
def feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    """Record item feedback (like/superlike/dislike) with instant acknowledgment.
    Returns a human-readable message about what the system learned."""
    if request.content_type not in VALID_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid content_type: '{request.content_type}'")
    if request.interaction_type not in VALID_INTERACTIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid interaction_type: '{request.interaction_type}'. Allowed: like, superlike, dislike"
        )

    raise HTTPException(status_code=422, detail="Use POST /users/{user_id}/feedback instead.")


@router.post("/users/{user_id}/feedback")
def user_feedback(user_id: str, request: FeedbackRequest, db: Session = Depends(get_db)):
    """Record item feedback for a specific user."""
    if request.content_type not in VALID_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid content_type: '{request.content_type}'")
    if request.interaction_type not in VALID_INTERACTIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid interaction_type: '{request.interaction_type}'. Allowed: like, superlike, dislike"
        )

    result = record_feedback(
        db,
        user_id=user_id,
        content_id=request.content_id,
        content_type=request.content_type,
        interaction_type=request.interaction_type
    )
    return result


# ── Personalized Recommendations ──────────────────────────────────────────────

@router.get("/recommendations/personalized")
def personalized(
    user_id: str = Query(..., description="User ID to personalize for"),
    target_types: List[str] = Query(
        default=["all"],
        description="Filter by content type: movie, song, game, book, or all"
    ),
    limit: int = Query(10, ge=1, le=20),
    alpha: float = Query(0.4, ge=0.0, le=1.0, description="Personalization strength (0.0=pure content, 1.0=pure taste)"),
    db: Session = Depends(get_db)
):
    """Get taste-personalized recommendations with 'Because...' explanations.
    Blends vector similarity with tag bridge preferences."""
    invalid = [t for t in target_types if t not in VALID_TYPES and t != "all"]
    if invalid:
        raise HTTPException(status_code=422, detail=f"Invalid target_types: {invalid}")

    result = get_personalized_recommendations(db, user_id, target_types, limit, alpha)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No profile found for user '{user_id}'. Use POST /users/onboard first."
        )
    return result


# ── Experience Bundle ─────────────────────────────────────────────────────────

@router.get("/recommendations/experience")
def experience_bundle(
    content_id: str = Query(..., description="ID of the item you just finished"),
    content_type: str = Query(..., pattern="^(movie|song|game|book)$", description="Type of the source item"),
    user_id: str = Query(default=None, description="Optional user ID for personalized bundle"),
    db: Session = Depends(get_db)
):
    """Get a curated 'Complete the Experience' bundle: 1 Movie + 1 Game + 1 Book + 1 Song
    that all match the vibe of the item you just finished."""
    try:
        result = get_experience_bundle(db, content_id, content_type, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return result





# ── Onboarding Preferences (First-Time Wizard) ───────────────────────────────

@router.post("/users/{user_id}/onboard-preferences")
def onboard_preferences(
    user_id: str,
    request: OnboardPreferencesRequest,
    db: Session = Depends(get_db)
):
    """Complete the onboarding wizard. Stores favorite types, keywords,
    and anchor items, then marks the user as onboarded."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Validate favorite types
    for ft in request.favorite_types:
        if ft not in VALID_TYPES:
            raise HTTPException(status_code=422, detail=f"Invalid content type: '{ft}'")

    # 1. Store keywords as UserInteraction with type 'keyword_preference'
    for keyword in request.keywords:
        kw_clean = keyword.strip().lower()
        if len(kw_clean) < 2:
            continue
        # Avoid duplicates
        exists = (
            db.query(UserInteraction)
            .filter(
                UserInteraction.user_id == user_id,
                UserInteraction.content_id == kw_clean,
                UserInteraction.content_type == "keyword",
                UserInteraction.interaction_type == "keyword_preference"
            )
            .first()
        )
        if not exists:
            db.add(UserInteraction(
                user_id=user_id,
                content_id=kw_clean,
                content_type="keyword",
                interaction_type="keyword_preference",
                weight=1.5,
                created_at=datetime.now(timezone.utc)
            ))

    # 2. Store favorite types as UserInteraction with type 'type_preference'
    for ft in request.favorite_types:
        exists = (
            db.query(UserInteraction)
            .filter(
                UserInteraction.user_id == user_id,
                UserInteraction.content_id == ft,
                UserInteraction.content_type == "preference",
                UserInteraction.interaction_type == "type_preference"
            )
            .first()
        )
        if not exists:
            db.add(UserInteraction(
                user_id=user_id,
                content_id=ft,
                content_type="preference",
                interaction_type="type_preference",
                weight=1.0,
                created_at=datetime.now(timezone.utc)
            ))

    # 3. Store anchor items via existing onboard_user
    if request.anchors:
        onboard_user(
            db,
            user_id=user_id,
            display_name=user.display_name,
            anchors=[a.model_dump() for a in request.anchors]
        )

    # 4. Mark user as onboarded
    user.is_onboarded = True
    db.commit()

    return {
        "status": "success",
        "message": f"Welcome aboard! Your taste profile is ready.",
        "favorite_types": request.favorite_types,
        "keywords_saved": len(request.keywords),
        "anchors_saved": len(request.anchors),
    }


# ── Dashboard Feed (Netflix-Style Sections) ──────────────────────────────────

@router.get("/users/{user_id}/dashboard-feed")
def dashboard_feed(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Returns a Netflix-style dashboard feed with multiple recommendation sections."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    sections = []

    # 1. Pre-fetch shared data ONCE to eliminate redundant DB query latency
    pre_taste_vector = compute_taste_vector(db, user_id)
    tag_prefs = get_tag_preferences(db, user_id, top_n=20)
    pre_tag_dict = {t["tag"]: t["score"] for t in tag_prefs}
    tag_names = [t["tag"] for t in tag_prefs[:5]]

    pre_all_embeddings = db.query(ContentEmbedding).all()
    user_interactions = db.query(UserInteraction).filter(UserInteraction.user_id == user_id).all()
    pre_interacted = {(inter.content_id, inter.content_type) for inter in user_interactions}

    # Get user's preferred types
    type_prefs = [inter.content_id for inter in user_interactions if inter.interaction_type == "type_preference"]
    preferred_types = type_prefs or ["movie", "game", "book", "song"]

    # Section 1: "Top Picks for You" — personalized blend across all types
    try:
        top_picks = get_personalized_recommendations(
            db, user_id, ["all"], limit=10, alpha=0.4,
            pre_taste_vector=pre_taste_vector, pre_tag_dict=pre_tag_dict,
            pre_all_embeddings=pre_all_embeddings, pre_interacted=pre_interacted
        )
        if top_picks and top_picks.get("recommendations"):
            sections.append({
                "id": "top-picks",
                "title": "Top Picks for You",
                "subtitle": "Personalized across all media",
                "items": top_picks["recommendations"]
            })
    except Exception:
        pass

    # Section 2-3: "Because you love [tag]" — tag-based sections (top 2 tags)
    for i, tag in enumerate(tag_names[:2]):
        try:
            tag_recs = get_personalized_recommendations(
                db, user_id, ["all"], limit=8, alpha=0.7,
                pre_taste_vector=pre_taste_vector, pre_tag_dict=pre_tag_dict,
                pre_all_embeddings=pre_all_embeddings, pre_interacted=pre_interacted
            )
            if tag_recs and tag_recs.get("recommendations"):
                tagged_items = [
                    r for r in tag_recs["recommendations"]
                    if tag in [t.lower() for t in r.get("matched_tags", [])]
                ]
                if len(tagged_items) < 3:
                    tagged_items = tag_recs["recommendations"][:8]
                sections.append({
                    "id": f"tag-{tag}",
                    "title": f"Because you love {tag}",
                    "subtitle": f"Curated around the '{tag}' vibe",
                    "items": tagged_items[:8]
                })
        except Exception:
            pass

    # Section 4+: Per-type sections for preferred types
    for ptype in preferred_types[:3]:
        try:
            type_recs = get_personalized_recommendations(
                db, user_id, [ptype], limit=10, alpha=0.3,
                pre_taste_vector=pre_taste_vector, pre_tag_dict=pre_tag_dict,
                pre_all_embeddings=pre_all_embeddings, pre_interacted=pre_interacted
            )
            if type_recs and type_recs.get("recommendations"):
                type_label = ptype.capitalize() + "s"
                sections.append({
                    "id": f"type-{ptype}",
                    "title": f"{type_label} for You",
                    "subtitle": f"Your personalized {ptype} picks",
                    "items": type_recs["recommendations"]
                })
        except Exception:
            pass

    # Fallback: Popular items if no sections were generated
    if not sections:
        try:
            from routes.content_browse import get_popular
            pop_items = get_popular(type=None, limit=12, db=db).get("results", [])
            if pop_items:
                formatted_pop = [
                    {
                        "id": p["content_id"],
                        "type": p["content_type"],
                        "title": p["title"],
                        "cover_path": p["cover_path"],
                        "match_score": 85.0,
                        "because_explanation": "Popular across CrossRec community"
                    }
                    for p in pop_items
                ]
                sections.append({
                    "id": "popular-fallback",
                    "title": "Trending Content",
                    "subtitle": "Popular items across movies, games, books & songs",
                    "items": formatted_pop
                })
        except Exception:
            pass

    # Pre-generate Experience Bundle payload in same response
    experience_bundle_data = None
    if sections and sections[0].get("items"):
        top_item = sections[0]["items"][0]
        try:
            experience_bundle_data = get_experience_bundle(db, top_item["id"], top_item["type"], user_id)
        except Exception:
            pass

    return {
        "user": {
            "user_id": user.user_id,
            "display_name": user.display_name,
            "taste_tags": tag_names,
        },
        "sections": sections,
        "experience_bundle": experience_bundle_data
    }
