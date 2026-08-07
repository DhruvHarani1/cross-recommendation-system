"""
Personalization Service — Taste Bridge & Psychological Personalization Engine

Provides: Onboarding, Taste Vector, Tag Bridge, Personalized Recs,
Experience Bundles, Mood Mode, Feedback Loop, and "Because..." Explanations.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
import numpy as np
from collections import Counter
from typing import List, Optional, Dict
from datetime import datetime, timezone
from sklearn.cluster import KMeans

from models import (
    User, UserInteraction,
    Movie, Book, Song, Game,
    MovieKeyword, BookKeyword, SongKeyword, GameKeyword,
    ContentEmbedding
)
from services.recommendation_service import (
    get_model, get_or_create_embedding, resolve_metadata, get_keywords_str,
    batch_resolve_metadata, batch_get_keywords
)




# Maps interaction types to their weights
INTERACTION_WEIGHTS = {
    "onboard_anchor": 1.5,
    "superlike": 2.0,
    "like": 1.0,
    "dislike": -1.5
}


# ── User Management ──────────────────────────────────────────────────────────

def get_or_create_user(db: Session, user_id: str, display_name: str = None) -> User:
    """Get existing user or create a new one."""
    user = db.get(User, user_id)
    if user:
        return user

    user = User(
        user_id=user_id,
        display_name=display_name or user_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(user)
    db.commit()
    return user


def get_user_profile(db: Session, user_id: str) -> dict:
    """Returns user profile with their liked items and top taste tags."""
    user = db.get(User, user_id)
    if not user:
        return None

    interactions = (
        db.query(UserInteraction)
        .filter(UserInteraction.user_id == user_id)
        .order_by(UserInteraction.created_at.desc())
        .all()
    )

    liked_items = []
    for i in interactions:
        meta = resolve_metadata(db, i.content_id, i.content_type)
        liked_items.append({
            "content_id": i.content_id,
            "content_type": i.content_type,
            "title": meta["title"],
            "cover_path": meta["cover_path"],
            "interaction": i.interaction_type,
            "weight": i.weight
        })

    top_tags = get_tag_preferences(db, user_id, top_n=10)

    return {
        "user_id": user.user_id,
        "display_name": user.display_name,
        "created_at": str(user.created_at),
        "interactions": liked_items,
        "top_taste_tags": top_tags
    }


# ── Onboarding ───────────────────────────────────────────────────────────────

def onboard_user(db: Session, user_id: str, display_name: str, anchors: List[dict]) -> dict:
    """Seed a user's taste profile with initial anchor items.

    anchors: list of {"content_id": str, "content_type": str}
    """
    user = get_or_create_user(db, user_id, display_name)

    added = []
    for anchor in anchors:
        cid = anchor["content_id"]
        ctype = anchor["content_type"]

        # Skip duplicates
        existing = (
            db.query(UserInteraction)
            .filter(
                UserInteraction.user_id == user_id,
                UserInteraction.content_id == cid,
                UserInteraction.content_type == ctype
            )
            .first()
        )
        if existing:
            continue

        db.add(UserInteraction(
            user_id=user_id,
            content_id=cid,
            content_type=ctype,
            interaction_type="onboard_anchor",
            weight=INTERACTION_WEIGHTS["onboard_anchor"],
            created_at=datetime.now(timezone.utc)
        ))
        meta = resolve_metadata(db, cid, ctype)
        added.append({"content_id": cid, "content_type": ctype, "title": meta["title"]})

    db.commit()

    top_tags = get_tag_preferences(db, user_id, top_n=5)

    return {
        "user_id": user_id,
        "display_name": user.display_name,
        "anchors_added": added,
        "initial_taste_tags": top_tags,
        "message": f"Welcome, {user.display_name}! Your taste profile is ready based on {len(added)} anchor items."
    }


# ── Feedback Loop ─────────────────────────────────────────────────────────────

def record_feedback(db: Session, user_id: str, content_id: str, content_type: str, interaction_type: str) -> dict:
    """Record a like/superlike/dislike and return human-readable acknowledgment."""
    get_or_create_user(db, user_id)

    # Remove any existing interaction for this item (replace)
    db.query(UserInteraction).filter(
        UserInteraction.user_id == user_id,
        UserInteraction.content_id == content_id,
        UserInteraction.content_type == content_type
    ).delete()

    weight = INTERACTION_WEIGHTS.get(interaction_type, 1.0)
    db.add(UserInteraction(
        user_id=user_id,
        content_id=content_id,
        content_type=content_type,
        interaction_type=interaction_type,
        weight=weight,
        created_at=datetime.now(timezone.utc)
    ))
    db.commit()

    meta = resolve_metadata(db, content_id, content_type)
    item_keywords = get_keywords_str(db, content_id, content_type)
    top_kws = [kw.strip() for kw in item_keywords.split(",")][:3] if item_keywords else []

    # Generate human-readable acknowledgment
    if interaction_type == "like":
        tag_str = " & ".join(top_kws) if top_kws else content_type
        message = f"Got it! Boosting recommendations with {tag_str} vibes similar to {meta['title']}."
    elif interaction_type == "superlike":
        tag_str = " & ".join(top_kws) if top_kws else content_type
        message = f"Love it! Heavily prioritizing {tag_str} themes. More like {meta['title']} incoming!"
    elif interaction_type == "dislike":
        tag_str = " & ".join(top_kws) if top_kws else content_type
        message = f"Got it — fewer {tag_str} recommendations. Adjusting your taste profile."
    else:
        message = "Feedback recorded."

    return {
        "status": "success",
        "action": f"{interaction_type}_recorded",
        "item": {"title": meta["title"], "type": content_type},
        "system_acknowledgment": message
    }


# ── Taste Vector (Weighted Embedding Centroid) ────────────────────────────────

def compute_taste_vector(db: Session, user_id: str) -> Optional[dict]:
    """
    Builds the user's taste profile using multi-vector clustering for positive interactions,
    and a distinct negative vector for dislikes.
    Returns: {"positive_clusters": [np.ndarray], "negative_vector": np.ndarray}
    """
    interactions = (
        db.query(UserInteraction)
        .filter(UserInteraction.user_id == user_id)
        .all()
    )
    if not interactions:
        return None

    pos_vectors = []
    pos_weights = []
    neg_vectors = []
    neg_weights = []

    for inter in interactions:
        try:
            emb = get_or_create_embedding(db, inter.content_id, inter.content_type)
            if inter.weight > 0:
                pos_vectors.append(emb)
                pos_weights.append(inter.weight)
            else:
                neg_vectors.append(emb)
                neg_weights.append(abs(inter.weight))
        except (ValueError, Exception):
            continue

    if not pos_vectors:
        return None

    pos_vectors = np.array(pos_vectors)
    pos_weights = np.array(pos_weights)
    
    # 1. Multi-Vector Profiles via KMeans Clustering
    # If a user has >= 4 positive items, cluster them into 2 distinct vectors to prevent "muddying"
    n_clusters = 2 if len(pos_vectors) >= 4 else 1
    
    clusters = []
    if n_clusters == 1:
        # Just weighted sum
        weighted_sum = np.sum(pos_vectors * pos_weights[:, np.newaxis], axis=0)
        norm = np.linalg.norm(weighted_sum)
        clusters.append(weighted_sum / norm if norm > 0 else weighted_sum)
    else:
        # Use KMeans
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=5)
        labels = kmeans.fit_predict(pos_vectors)
        
        for i in range(n_clusters):
            idx = np.where(labels == i)[0]
            if len(idx) > 0:
                weighted_sum = np.sum(pos_vectors[idx] * pos_weights[idx, np.newaxis], axis=0)
                norm = np.linalg.norm(weighted_sum)
                clusters.append(weighted_sum / norm if norm > 0 else weighted_sum)

    # 2. Negative Space Vector
    negative_vector = None
    if neg_vectors:
        neg_vectors = np.array(neg_vectors)
        neg_weights = np.array(neg_weights)
        weighted_neg = np.sum(neg_vectors * neg_weights[:, np.newaxis], axis=0)
        norm = np.linalg.norm(weighted_neg)
        negative_vector = weighted_neg / norm if norm > 0 else None

    return {
        "positive_clusters": clusters,
        "negative_vector": negative_vector
    }


# ── Tag Bridge (Keyword Preference Dictionary) ───────────────────────────────

def get_tag_preferences(db: Session, user_id: str, top_n: int = 10) -> List[dict]:
    """Computes TF-IDF-weighted tag preferences from user's liked items.
    Returns list of {tag, score} sorted by score."""
    interactions = (
        db.query(UserInteraction)
        .filter(
            UserInteraction.user_id == user_id,
            UserInteraction.weight > 0  # Only positive interactions
        )
        .all()
    )
    if not interactions:
        return []

    tag_scores = Counter()
    for inter in interactions:
        if inter.interaction_type == "keyword_preference" or inter.content_type == "keyword":
            tag_scores[inter.content_id.lower()] += inter.weight
            continue
        kw_str = get_keywords_str(db, inter.content_id, inter.content_type)
        if not kw_str:
            continue
        for kw in kw_str.split(", "):
            kw = kw.strip().lower()
            if len(kw) >= 3:
                tag_scores[kw] += inter.weight

    # IDF-like rarity boost: tags that appear in fewer interactions are more distinctive
    total_interactions = len(interactions)
    tag_freq = Counter()
    for inter in interactions:
        kw_str = get_keywords_str(db, inter.content_id, inter.content_type)
        seen = set()
        for kw in kw_str.split(", "):
            kw = kw.strip().lower()
            if kw not in seen and len(kw) >= 3:
                tag_freq[kw] += 1
                seen.add(kw)

    for tag in tag_scores:
        idf = np.log(1 + total_interactions / tag_freq.get(tag, 1))
        tag_scores[tag] *= idf

    top_tags = tag_scores.most_common(top_n)
    return [{"tag": tag, "score": round(score, 2)} for tag, score in top_tags]


# ── "Because..." Explanation Generator ────────────────────────────────────────

def generate_because_explanation(
    db: Session,
    user_id: str,
    recommended_id: str,
    recommended_type: str,
    source_title: str = None
) -> str:
    """Generate a human-readable 'Because you loved...' explanation."""
    rec_kws = get_keywords_str(db, recommended_id, recommended_type)
    if not rec_kws:
        return f"Matches your taste profile across {recommended_type} themes"

    rec_kw_set = set(kw.strip().lower() for kw in rec_kws.split(", ") if len(kw.strip()) >= 3)

    # Find which user-liked content items (movies, games, books, songs) share tags
    interactions = (
        db.query(UserInteraction)
        .filter(
            UserInteraction.user_id == user_id,
            UserInteraction.weight > 0,
            UserInteraction.content_type.in_(["movie", "game", "book", "song"])
        )
        .limit(10)
        .all()
    )

    best_overlap_title = source_title
    best_overlap_tags = []

    for inter in interactions:
        inter_meta = resolve_metadata(db, inter.content_id, inter.content_type)
        inter_kws = get_keywords_str(db, inter.content_id, inter.content_type)
        if not inter_kws:
            continue
        inter_kw_set = set(kw.strip().lower() for kw in inter_kws.split(", ") if len(kw.strip()) >= 3)

        shared = rec_kw_set & inter_kw_set
        if len(shared) > len(best_overlap_tags):
            best_overlap_tags = list(shared)[:3]
            best_overlap_title = inter_meta["title"]

    if best_overlap_tags and best_overlap_title:
        tag_phrase = " & ".join(best_overlap_tags[:2])
        return f"Because you loved the {tag_phrase} themes in {best_overlap_title}"
    elif best_overlap_title:
        return f"Similar mood and themes to {best_overlap_title}"
    else:
        return f"Matches your taste profile across {recommended_type} themes"


# ── Personalized Recommendations ──────────────────────────────────────────────

def get_personalized_recommendations(
    db: Session,
    user_id: str,
    target_types: List[str] = None,
    limit: int = 10,
    alpha: float = 0.4,
    pre_taste_vector: Optional[dict] = None,
    pre_tag_dict: Optional[dict] = None,
    pre_interacted: Optional[set] = None
) -> Optional[dict]:
    """Generate personalized recommendations blending taste vector + tag bridge using vectorized NumPy matrix math."""
    taste_profile = pre_taste_vector if pre_taste_vector is not None else compute_taste_vector(db, user_id)
    if taste_profile is None:
        return None

    if pre_tag_dict is not None:
        tag_dict = pre_tag_dict
    else:
        tag_prefs = get_tag_preferences(db, user_id, top_n=20)
        tag_dict = {t["tag"]: t["score"] for t in tag_prefs}

    if not target_types or "all" in target_types:
        filter_types = ["movie", "game", "book", "song"]
    else:
        filter_types = target_types

    from services.recommendation_service import _get_or_load_cache
    cache = _get_or_load_cache(db)
    
    # Exclude items the user has already interacted with
    if pre_interacted is not None:
        interacted = pre_interacted
    else:
        user_interactions = db.query(UserInteraction).filter(UserInteraction.user_id == user_id).all()
        interacted = {(inter.content_id, inter.content_type) for inter in user_interactions}

    # Vectorized similarity matrix calculation
    if isinstance(taste_profile, np.ndarray):
        pos_clusters = [taste_profile]
        neg_vector = None
    else:
        pos_clusters = taste_profile.get("positive_clusters", [])
        neg_vector = taste_profile.get("negative_vector", None)

    matrix = cache["matrix"]
    metadata = cache["metadata"]

    vector_sims = np.zeros(len(metadata)) - 1.0
    for cluster in pos_clusters:
        cluster_norm = np.linalg.norm(cluster)
        if cluster_norm == 0: cluster_norm = 1.0
        sims = np.dot(matrix, cluster) / cluster_norm
        vector_sims = np.maximum(vector_sims, sims)

    if neg_vector is not None:
        neg_norm = np.linalg.norm(neg_vector)
        if neg_norm == 0: neg_norm = 1.0
        neg_sims = np.dot(matrix, neg_vector) / neg_norm
        vector_sims = vector_sims - 0.5 * np.maximum(0, neg_sims)

    # Take top indices by vector similarity for tag scoring
    top_indices = np.argsort(vector_sims)[::-1][:200]
    
    top_candidates = []
    for idx in top_indices:
        meta = metadata[idx]
        if (meta["id"], meta["type"]) in interacted:
            continue
        if filter_types and meta["type"] not in filter_types:
            continue
        top_candidates.append((meta, float(vector_sims[idx])))
        if len(top_candidates) >= 60:
            break

    cand_keys = [(meta["id"], meta["type"]) for meta, _ in top_candidates]

    # Single batch SQL query for keywords across all top candidates
    keywords_map = batch_get_keywords(db, cand_keys)
    max_possible_tag = sum(sorted(tag_dict.values(), reverse=True)[:5]) if tag_dict else 1.0

    scored_items = []
    for meta, v_sim in top_candidates:
        # Tag bridge score from pre-fetched batch dictionary
        cand_kws = keywords_map.get((meta["type"], meta["id"]), "")
        tag_score = 0.0
        matched_tags = []
        if cand_kws:
            for kw in cand_kws.split(", "):
                kw_lower = kw.strip().lower()
                if kw_lower in tag_dict:
                    tag_score += tag_dict[kw_lower]
                    matched_tags.append(kw_lower)

        tag_sim = min(tag_score / max_possible_tag, 1.0) if max_possible_tag > 0 else 0.0
        final_score = (1 - alpha) * v_sim + alpha * tag_sim

        scored_items.append({
            "content_id": meta["id"],
            "content_type": meta["type"],
            "score": final_score,
            "matched_tags": matched_tags[:3]
        })

    scored_items.sort(key=lambda x: x["score"], reverse=True)

    # Batch resolve metadata for all scored candidate items
    selected_keys = [(item["content_id"], item["content_type"]) for item in scored_items]
    metadata_map = batch_resolve_metadata(db, selected_keys)

    recommendations = []
    type_counts = Counter()
    max_per_type = max(2, limit // 3)

    for item in scored_items:
        if len(recommendations) >= limit:
            break
        if filter_types and len(filter_types) == 1:
            pass
        elif type_counts[item["content_type"]] >= max_per_type:
            continue
        type_counts[item["content_type"]] += 1

        meta = metadata_map.get((item["content_type"], item["content_id"])) or resolve_metadata(db, item["content_id"], item["content_type"])
        explanation = generate_because_explanation(db, user_id, item["content_id"], item["content_type"])

        rec = {
            "id": item["content_id"],
            "type": item["content_type"],
            "title": meta["title"],
            "cover_path": meta["cover_path"],
            "match_score": round(item["score"] * 100, 1),
            "because_explanation": explanation,
            "matched_tags": item["matched_tags"]
        }

        if item["content_type"] == "song" and "artist" in meta:
            rec["artist"] = meta["artist"]

        recommendations.append(rec)

    top_tags = get_tag_preferences(db, user_id, top_n=5)

    return {
        "user_id": user_id,
        "taste_profile_tags": [t["tag"] for t in top_tags],
        "recommendations": recommendations
    }


# ── Experience Bundle ─────────────────────────────────────────────────────────

def get_experience_bundle(
    db: Session,
    content_id: str,
    content_type: str,
    user_id: str = None
) -> dict:
    """Returns a curated 4-domain experience bundle for a given item.
    One best match per domain: Movie, Game, Book, Song.
    """
    source_vector = get_or_create_embedding(db, content_id, content_type)
    source_meta = resolve_metadata(db, content_id, content_type)
    source_kws = get_keywords_str(db, content_id, content_type)
    source_kw_set = set(kw.strip().lower() for kw in source_kws.split(", ") if len(kw.strip()) >= 3)

    # Optionally blend with user taste
    taste_vector = None
    if user_id:
        taste_vector = compute_taste_vector(db, user_id)

    bundle = {}
    DOMAIN_ROLES = {
        "movie": "The next movie to watch",
        "game": "The game to live in that world",
        "book": "The book to read deeper",
        "song": "The soundtrack to recapture the mood"
    }

    from services.recommendation_service import _get_or_load_cache
    cache = _get_or_load_cache(db)
    matrix = cache["matrix"]
    metadata = cache["metadata"]
    
    # Normalize source
    norm_s = np.linalg.norm(source_vector)
    if norm_s > 0: source_vector = source_vector / norm_s

    for domain, role in DOMAIN_ROLES.items():
        # Filter metadata by domain
        domain_indices = [i for i, m in enumerate(metadata) if m["type"] == domain and not (m["id"] == content_id and m["type"] == content_type)]
        if not domain_indices:
            continue
            
        domain_matrix = matrix[domain_indices]
        
        # Content similarity (vectorized)
        sims = np.dot(domain_matrix, source_vector)
        
        # Taste bonus (vectorized)
        taste_bonus = np.zeros(len(domain_indices))
        if taste_vector is not None:
            if isinstance(taste_vector, np.ndarray):
                pos_clusters = [taste_vector]
                neg_vector = None
            else:
                pos_clusters = taste_vector.get("positive_clusters", [])
                neg_vector = taste_vector.get("negative_vector", None)
                
            for cluster in pos_clusters:
                t_norm = np.linalg.norm(cluster)
                if t_norm > 0:
                    t_dot = np.dot(domain_matrix, cluster)
                    cluster_bonus = (t_dot / t_norm) * 0.15
                    taste_bonus = np.maximum(taste_bonus, cluster_bonus)
                    
            if neg_vector is not None:
                n_norm = np.linalg.norm(neg_vector)
                if n_norm > 0:
                    n_dot = np.dot(domain_matrix, neg_vector)
                    n_sim = n_dot / n_norm
                    taste_bonus = taste_bonus - 0.10 * np.maximum(0, n_sim)
        
        base_scores = sims + taste_bonus
        
        # Take top 30 candidates by base score to calculate tag bonus
        top_local_indices = np.argsort(base_scores)[::-1][:30]
        
        cand_keys = []
        top_candidates = []
        for i in top_local_indices:
            orig_meta = metadata[domain_indices[i]]
            cand_keys.append((orig_meta["id"], orig_meta["type"]))
            top_candidates.append((orig_meta, float(base_scores[i])))
        from services.recommendation_service import batch_get_keywords
        keywords_map = batch_get_keywords(db, cand_keys)
        
        best_score = -1.0
        best_item = None
        best_shared_tags = []

        for meta, base_score in top_candidates:
            # Tag overlap bonus
            cand_kws_str = keywords_map.get((meta["type"], meta["id"]), "")
            cand_kw_set = set(kw.strip().lower() for kw in cand_kws_str.split(", ") if len(kw.strip()) >= 3)
            shared = source_kw_set & cand_kw_set
            tag_bonus = min(len(shared) * 0.05, 0.2)  # up to 0.2 bonus
            
            total = base_score + tag_bonus
            
            if total > best_score:
                best_score = total
                best_item = meta
                best_shared_tags = list(shared)[:3]

        if best_item:
            meta = resolve_metadata(db, best_item["id"], best_item["type"])

            # Build reason string
            if best_shared_tags:
                tag_phrase = " & ".join(best_shared_tags[:2])
                reason = f"{role} — shares the {tag_phrase} vibe of {source_meta['title']}."
            else:
                reason = f"{role} — similar mood and themes to {source_meta['title']}."

            entry = {
                "id": best_item["id"],
                "title": meta["title"],
                "cover_path": meta["cover_path"],
                "match_score": round(best_score * 100, 1),
                "reason": reason
            }

            # Extra metadata
            if domain == "song":
                song = db.get(Song, best_item["id"])
                if song:
                    entry["artist"] = song.song_artist

            bundle[domain] = entry

    return {
        "source_item": {
            "id": content_id,
            "type": content_type,
            "title": source_meta["title"],
            "cover_path": source_meta["cover_path"]
        },
        "experience_bundle": bundle
    }



