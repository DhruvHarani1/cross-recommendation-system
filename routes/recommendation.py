from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas.recommendation import RecommendationResponse, SearchRecommendationResponse
from services.recommendation_service import (
    get_recommendations,
    resolve_metadata,
    get_or_create_embedding,
    search_and_recommend
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)

VALID_TYPES = {"movie", "song", "game", "book"}

@router.get("/search", response_model=SearchRecommendationResponse)
def search_and_get_recommendations(
    q: str = Query(..., min_length=2, description="Free-text search query (title, concept, description)"),
    source_type: str = Query(
        default=None,
        description="Optional. Narrow search to a specific type: movie, song, game, or book. Omit to search all."
    ),
    target_types: List[str] = Query(
        default=["all"],
        description="Filter recommendations by category. Pass multiple times to combine. E.g. ?target_types=game&target_types=song. Use 'all' for everything."
    ),
    limit: int = Query(5, ge=1, le=20, description="Number of recommendations to return"),
    db: Session = Depends(get_db)
):
    # Validate source_type if provided
    if source_type and source_type not in VALID_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid source_type: '{source_type}'. Allowed values: movie, song, game, book"
        )

    # Validate target_types values
    invalid = [t for t in target_types if t not in VALID_TYPES and t != "all"]
    if invalid:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid target_types: {invalid}. Allowed values: all, movie, song, game, book"
        )

    result = search_and_recommend(db, query_text=q, source_type=source_type, target_types=target_types, limit=limit)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No items found matching query '{q}'"
        )
    return result


@router.get("/", response_model=RecommendationResponse)
def get_cross_recommendations(
    source_id: str = Query(..., description="ID of the source item"),
    source_type: str = Query(..., pattern="^(movie|song|game|book)$", description="Type of the source item (movie, book, song, game)"),
    target_types: List[str] = Query(
        default=["all"],
        description="Filter recommendations by category. Pass multiple times to combine. E.g. ?target_types=game&target_types=song. Use 'all' for everything."
    ),
    limit: int = Query(5, ge=1, le=20, description="Number of recommendations to return"),
    db: Session = Depends(get_db)
):
    # Validate target_types values
    invalid = [t for t in target_types if t not in VALID_TYPES and t != "all"]
    if invalid:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid target_types: {invalid}. Allowed values: all, movie, song, game, book"
        )

    # 1. Resolve source item title to ensure it exists
    meta = resolve_metadata(db, source_id, source_type)
    if not meta or not meta.get("title") or meta["title"] == f"{source_type.capitalize()} {source_id}":
        try:
            get_or_create_embedding(db, source_id, source_type)
            meta = resolve_metadata(db, source_id, source_type)
        except Exception:
            raise HTTPException(
                status_code=404,
                detail=f"Source {source_type} with ID {source_id} not found."
            )

    # 2. Fetch recommendations
    try:
        recommendations = get_recommendations(
            db=db,
            source_id=source_id,
            source_type=source_type,
            target_types=target_types,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )

    return {
        "source_id": source_id,
        "source_title": meta["title"],
        "recommendations": recommendations
    }
