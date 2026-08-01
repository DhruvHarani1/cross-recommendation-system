from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas.recommendation import RecommendationResponse
from services.recommendation_service import get_recommendations, resolve_metadata, get_or_create_embedding

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)

@router.get("/", response_model=RecommendationResponse)
def get_cross_recommendations(
    source_id: str = Query(..., description="ID of the source item"),
    source_type: str = Query(..., pattern="^(movie|song|game|book)$", description="Type of the source item (movie, book, song, game)"),
    target_type: str = Query("all", pattern="^(all|movie|song|game|book)$", description="Filter recommendations to this type: all, movie, book, song, game"),
    limit: int = Query(5, ge=1, le=20, description="Number of recommendations to return"),
    db: Session = Depends(get_db)
):
    # 1. Resolve source item title to ensure it exists
    meta = resolve_metadata(db, source_id, source_type)
    if not meta or not meta.get("title") or meta["title"] == f"{source_type.capitalize()} {source_id}":
        # Fallback check: try generating/fetching embedding to verify existence
        try:
            get_or_create_embedding(db, source_id, source_type)
            # Re-fetch metadata if embedding was successfully generated/verified
            meta = resolve_metadata(db, source_id, source_type)
        except Exception as e:
            raise HTTPException(
                status_code=404, 
                detail=f"Source {source_type} with ID {source_id} not found."
            )

    # 2. Fetch the recommendations using our recommendation service
    try:
        recommendations = get_recommendations(
            db=db,
            source_id=source_id,
            source_type=source_type,
            target_type=target_type,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )

    # 3. Return response conforming to RecommendationResponse schema
    return {
        "source_id": source_id,
        "source_title": meta["title"],
        "recommendations": recommendations
    }
