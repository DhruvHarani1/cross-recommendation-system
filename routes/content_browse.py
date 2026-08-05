"""
Content browsing routes — search and popular items for the onboarding wizard.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from database import get_db
from models import Movie, Book, Song, Game, ContentEmbedding

router = APIRouter(
    prefix="/content",
    tags=["Content Browse"]
)

VALID_TYPES = {"movie", "song", "game", "book"}


from services.api_fallback_service import search_external_apis

@router.get("/search")
def search_content(
    q: str = Query(..., min_length=1, description="Search query"),
    type: Optional[str] = Query(None, description="Filter by content type: movie, song, game, book"),
    limit: int = Query(12, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Search content by title: First queries the local database.
    If not present or insufficient, falls back to external APIs (TMDB, RAWG, Google Books, Last.fm)
    and saves the discovered item into the database."""
    results = []
    search_term = f"%{q.lower()}%"

    types_to_search = [type] if type and type in VALID_TYPES else list(VALID_TYPES)

    # 1. Search Local Database First
    for ctype in types_to_search:
        if ctype == "movie":
            items = (
                db.query(Movie)
                .filter(func.lower(Movie.movie_title).like(search_term))
                .limit(limit)
                .all()
            )
            for item in items:
                results.append({
                    "content_id": item.movie_id,
                    "content_type": "movie",
                    "title": item.movie_title,
                    "cover_path": f"https://image.tmdb.org/t/p/w500{item.movie_poster_path}" if item.movie_poster_path and item.movie_poster_path.startswith("/") else item.movie_poster_path,
                })

        elif ctype == "book":
            items = (
                db.query(Book)
                .filter(func.lower(Book.book_title).like(search_term))
                .limit(limit)
                .all()
            )
            for item in items:
                results.append({
                    "content_id": item.book_id,
                    "content_type": "book",
                    "title": item.book_title,
                    "cover_path": item.book_cover_path,
                })

        elif ctype == "game":
            items = (
                db.query(Game)
                .filter(func.lower(Game.game_title).like(search_term))
                .limit(limit)
                .all()
            )
            for item in items:
                results.append({
                    "content_id": item.game_id,
                    "content_type": "game",
                    "title": item.game_title,
                    "cover_path": item.game_cover_path,
                })

        elif ctype == "song":
            items = (
                db.query(Song)
                .filter(func.lower(Song.song_title).like(search_term))
                .limit(limit)
                .all()
            )
            for item in items:
                results.append({
                    "content_id": item.song_id,
                    "content_type": "song",
                    "title": item.song_title,
                    "cover_path": item.song_cover_path,
                    "artist": item.song_artist,
                })

    # 2. If no results found in DB (or fewer than limit), Fallback to External APIs
    if len(results) < limit:
        for ctype in types_to_search:
            try:
                fb_result = search_external_apis(db, q, source_type=ctype)
                if fb_result:
                    cid, ctype_found = fb_result
                    # Avoid duplicates
                    if not any(r["content_id"] == cid and r["content_type"] == ctype_found for r in results):
                        item = _resolve_item(db, cid, ctype_found)
                        if item:
                            results.append(item)
            except Exception:
                pass

    return {"results": results[:limit]}


@router.get("/popular")
def get_popular(
    type: Optional[str] = Query(None, description="Filter by content type"),
    limit: int = Query(12, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get popular/top content items (by popularity_score from embeddings table).
    Used to populate the onboarding picker with suggestions."""
    results = []

    types_to_fetch = [type] if type and type in VALID_TYPES else list(VALID_TYPES)
    per_type_limit = max(3, limit // len(types_to_fetch))

    for ctype in types_to_fetch:
        # Get items with highest popularity scores
        embeddings = (
            db.query(ContentEmbedding)
            .filter(ContentEmbedding.content_type == ctype)
            .order_by(ContentEmbedding.popularity_score.desc())
            .limit(per_type_limit)
            .all()
        )

        for emb in embeddings:
            item = _resolve_item(db, emb.content_id, ctype)
            if item:
                results.append(item)

    return {"results": results[:limit]}


def _resolve_item(db: Session, content_id: str, content_type: str) -> Optional[dict]:
    """Resolve a content item to its metadata."""
    if content_type == "movie":
        m = db.get(Movie, content_id)
        if m:
            return {
                "content_id": m.movie_id,
                "content_type": "movie",
                "title": m.movie_title,
                "cover_path": f"https://image.tmdb.org/t/p/w500{m.movie_poster_path}" if m.movie_poster_path and m.movie_poster_path.startswith("/") else m.movie_poster_path,
            }
    elif content_type == "book":
        b = db.get(Book, content_id)
        if b:
            return {
                "content_id": b.book_id,
                "content_type": "book",
                "title": b.book_title,
                "cover_path": b.book_cover_path,
            }
    elif content_type == "game":
        g = db.get(Game, content_id)
        if g:
            return {
                "content_id": g.game_id,
                "content_type": "game",
                "title": g.game_title,
                "cover_path": g.game_cover_path,
            }
    elif content_type == "song":
        s = db.get(Song, content_id)
        if s:
            return {
                "content_id": s.song_id,
                "content_type": "song",
                "title": s.song_title,
                "cover_path": s.song_cover_path,
                "artist": s.song_artist,
            }
    return None
