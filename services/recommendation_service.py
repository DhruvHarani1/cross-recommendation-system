from sqlalchemy.orm import Session
import numpy as np
from collections import defaultdict
from sentence_transformers import SentenceTransformer
from models import (
    Movie, MovieKeyword,
    Book, BookKeyword,
    Song, SongKeyword,
    Game, GameKeyword,
    ContentEmbedding
)

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def get_keywords_str(db: Session, content_id: str, content_type: str) -> str:
    """Fetches a comma-separated list of keywords for any content type."""
    if content_type == "movie":
        keywords = db.query(MovieKeyword).filter(MovieKeyword.movie_id == content_id).all()
    elif content_type == "game":
        keywords = db.query(GameKeyword).filter(GameKeyword.game_id == content_id).all()
    elif content_type == "song":
        keywords = db.query(SongKeyword).filter(SongKeyword.song_id == content_id).all()
    elif content_type == "book":
        keywords = db.query(BookKeyword).filter(BookKeyword.book_id == content_id).all()
    else:
        keywords = []
    return ", ".join([k.keyword for k in keywords])

def resolve_metadata(db: Session, item_id: str, item_type: str):
    """Retrieves title and cover image for any given item type."""
    if item_type == "movie":
        item = db.get(Movie, item_id)
        return {
            "title": item.movie_title if item else f"Movie {item_id}",
            "cover_path": item.movie_poster_path if item else None
        }
    elif item_type == "game":
        item = db.get(Game, item_id)
        return {
            "title": item.game_title if item else f"Game {item_id}",
            "cover_path": item.game_cover_path if item else None
        }
    elif item_type == "song":
        item = db.get(Song, item_id)
        return {
            "title": item.song_title if item else f"Song {item_id}",
            "cover_path": item.song_cover_path if item else None
        }
    elif item_type == "book":
        item = db.get(Book, item_id)
        return {
            "title": item.book_title if item else f"Book {item_id}",
            "cover_path": item.book_cover_path if item else None
        }
    return {"title": f"{item_type.capitalize()} {item_id}", "cover_path": None}
def get_or_create_embedding(db: Session , content_id :str , content_type:str)->np.array:
    record = db.query(ContentEmbedding).filter_by(content_type=content_type,content_id=content_id).first()
    if  record:
        return np.array(record.embedding)
    keyword_str = get_keywords_str(db,content_id,content_type)
    if content_type == "movie":
        item = db.get(Movie, content_id)
        if not item:
            raise ValueError(f"Movie with ID {content_id} not found.")
        input_text = f"Title: {item.movie_title}. Overview: {item.movie_overview}. Keywords: {keyword_str}"
    elif content_type == "game":
        item = db.get(Game, content_id)
        if not item:
            raise ValueError(f"Game with ID {content_id} not found.")
        input_text = f"Title: {item.game_title}. Genres: {item.game_genres}. Keywords: {keyword_str}"
    elif content_type == "song":
        item = db.get(Song, content_id)
        if not item:
            raise ValueError(f"Song with ID {content_id} not found.")
        input_text = f"Title: {item.song_title}. Artist: {item.song_artist}. Keywords: {keyword_str}"
    elif content_type == "book":
        item = db.get(Book, content_id)
        if not item:
            raise ValueError(f"Book with ID {content_id} not found.")
        input_text = f"Title: {item.book_title}. Overview: {item.book_overview}. Category: {item.book_categories}. Keywords: {keyword_str}"
    else:
        raise ValueError(f"Invalid content type: {content_type}")
    
    vector = get_model().encode(input_text).tolist()
    
    embedding_record = ContentEmbedding(
        content_id = content_id,
        content_type = content_type,
        embedding = vector,
        popularity_score=50.0
    )
    db.add(embedding_record)
    db.commit()
    return np.array(vector)

def get_recommendations(db: Session, source_id: str, source_type: str, target_type: str = "all", limit: int = 5):
    """Calculates cross-recommendations using cosine similarity & popularity.
    
    When target_type='all', results are balanced across all content categories
    so no single category dominates the output (diversity mode).
    When a specific target_type is chosen, all results come from that category.
    """
    # 1. Fetch source vector
    source_vector = get_or_create_embedding(db, str(source_id), source_type)

    # 2. Get target candidates from the DB
    query = db.query(ContentEmbedding)
    if target_type != "all":
        # Specific category requested — no balancing needed
        query = query.filter_by(content_type=target_type)
    candidates = query.all()
    if not candidates:
        return []

    # 3. Calculate similarity score for each candidate
    scored_items = []
    for cand in candidates:
        # Skip the exact source item itself
        if cand.content_type == source_type and cand.content_id == str(source_id):
            continue
        cand_vector = np.array(cand.embedding)

        dot_product = np.dot(source_vector, cand_vector)
        norm_src = np.linalg.norm(source_vector)
        norm_cand = np.linalg.norm(cand_vector)
        similarity = float(dot_product / (norm_src * norm_cand)) if norm_src and norm_cand else 0.0

        final_score = (0.8 * similarity) + (0.2 * (cand.popularity_score / 100.0))

        scored_items.append({
            "id": cand.content_id,
            "type": cand.content_type,
            "similarity": similarity,
            "final_score": final_score
        })

    if not scored_items:
        return []

    # 4. Diversity balancing (only when target_type == "all")
    if target_type == "all":
        # Group scored items by content type, each sorted best-first
        per_type: dict = defaultdict(list)
        for item in scored_items:
            per_type[item["type"]].append(item)
        for t in per_type:
            per_type[t].sort(key=lambda x: x["final_score"], reverse=True)

        active_types = list(per_type.keys())
        num_types = len(active_types)

        # Base slots per category (at least 1 per type)
        base_per_type = max(1, limit // num_types)

        balanced = []
        # Take the top `base_per_type` from each category
        for t in active_types:
            balanced.extend(per_type[t][:base_per_type])

        # Fill remaining slots with the best overall scores not yet included
        already_selected = {(i["type"], i["id"]) for i in balanced}
        remaining_slots = limit - len(balanced)

        if remaining_slots > 0:
            overflow_pool = [
                item for item in scored_items
                if (item["type"], item["id"]) not in already_selected
            ]
            overflow_pool.sort(key=lambda x: x["final_score"], reverse=True)
            balanced.extend(overflow_pool[:remaining_slots])

        # Final sort so highest scoring items appear first within the balanced set
        balanced.sort(key=lambda x: x["final_score"], reverse=True)
        top_candidates = balanced[:limit]
    else:
        # Single target type — plain sort, no balancing needed
        scored_items.sort(key=lambda x: x["final_score"], reverse=True)
        top_candidates = scored_items[:limit]

    # 5. Build final recommendation items list with metadata
    recommendations = []
    for item in top_candidates:
        meta = resolve_metadata(db, item["id"], item["type"])
        recommendations.append({
            "id": item["id"],
            "type": item["type"],
            "title": meta["title"],
            "cover_path": meta["cover_path"],
            "match_score": round(item["similarity"] * 100, 1),
            "explanation": f"Matched because of similar {item['type']} themes"
        })
    return recommendations