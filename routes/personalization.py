from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from services.personalization_service import (
    onboard_user,
    get_user_profile,
    record_feedback,
    get_personalized_recommendations,
    get_experience_bundle,
    get_mood_recommendations,
    MOOD_PRESETS
)

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


# ── Mood Mode ─────────────────────────────────────────────────────────────────

@router.get("/recommendations/mood")
def mood_mode(
    mood: str = Query(
        ...,
        description=f"Mood preset: {', '.join(MOOD_PRESETS.keys())}"
    ),
    user_id: str = Query(default=None, description="Optional user ID for personalized mood results"),
    target_types: List[str] = Query(default=["all"], description="Filter by content type"),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get cross-domain recommendations filtered by mood.
    Available moods: dark_immersive, adrenaline_rush, cozy_escape, mind_bending, epic_fantasy."""
    if mood not in MOOD_PRESETS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid mood: '{mood}'. Available: {list(MOOD_PRESETS.keys())}"
        )

    invalid = [t for t in target_types if t not in VALID_TYPES and t != "all"]
    if invalid:
        raise HTTPException(status_code=422, detail=f"Invalid target_types: {invalid}")

    result = get_mood_recommendations(db, mood, user_id, target_types, limit)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to generate mood recommendations.")
    return result
