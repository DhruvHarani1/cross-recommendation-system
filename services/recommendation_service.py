from sqlalchemy.orm import Session
import numpy as np
from collections import defaultdict
from typing import List, Optional
import Levenshtein
from sentence_transformers import SentenceTransformer
from models import (
    Movie, MovieKeyword,
    Book, BookKeyword,
    Song, SongKeyword,
    Game, GameKeyword,
    ContentEmbedding
)
from services.api_fallback_service import search_external_apis

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

def batch_resolve_metadata(db: Session, items: List[tuple]) -> dict:
    """Batch fetch title and cover_path for a list of (content_id, content_type) tuples."""
    results = {}
    if not items:
        return results

    movie_ids = [cid for cid, ctype in items if ctype == "movie"]
    game_ids = [cid for cid, ctype in items if ctype == "game"]
    book_ids = [cid for cid, ctype in items if ctype == "book"]
    song_ids = [cid for cid, ctype in items if ctype == "song"]

    if movie_ids:
        for m in db.query(Movie).filter(Movie.movie_id.in_(movie_ids)).all():
            results[("movie", m.movie_id)] = {"title": m.movie_title, "cover_path": m.movie_poster_path}

    if game_ids:
        for g in db.query(Game).filter(Game.game_id.in_(game_ids)).all():
            results[("game", g.game_id)] = {"title": g.game_title, "cover_path": g.game_cover_path}

    if book_ids:
        for b in db.query(Book).filter(Book.book_id.in_(book_ids)).all():
            results[("book", b.book_id)] = {"title": b.book_title, "cover_path": b.book_cover_path}

    if song_ids:
        for s in db.query(Song).filter(Song.song_id.in_(song_ids)).all():
            results[("song", s.song_id)] = {"title": s.song_title, "cover_path": s.song_cover_path, "artist": s.song_artist}

    for cid, ctype in items:
        if (ctype, cid) not in results:
            results[(ctype, cid)] = {"title": f"{ctype.capitalize()} {cid}", "cover_path": None}

    return results

def batch_get_keywords(db: Session, items: List[tuple]) -> dict:
    """Batch fetch comma-separated keywords for a list of (content_id, content_type) tuples."""
    raw = defaultdict(list)
    if not items:
        return {}

    movie_ids = [cid for cid, ctype in items if ctype == "movie"]
    game_ids = [cid for cid, ctype in items if ctype == "game"]
    book_ids = [cid for cid, ctype in items if ctype == "book"]
    song_ids = [cid for cid, ctype in items if ctype == "song"]

    if movie_ids:
        for k in db.query(MovieKeyword).filter(MovieKeyword.movie_id.in_(movie_ids)).all():
            raw[("movie", k.movie_id)].append(k.keyword)

    if game_ids:
        for k in db.query(GameKeyword).filter(GameKeyword.game_id.in_(game_ids)).all():
            raw[("game", k.game_id)].append(k.keyword)

    if book_ids:
        for k in db.query(BookKeyword).filter(BookKeyword.book_id.in_(book_ids)).all():
            raw[("book", k.book_id)].append(k.keyword)

    if song_ids:
        for k in db.query(SongKeyword).filter(SongKeyword.song_id.in_(song_ids)).all():
            raw[("song", k.song_id)].append(k.keyword)

    return {key: ", ".join(vals) for key, vals in raw.items()}
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
    elif content_type == "keyword":
        input_text = f"Theme and vibe: {content_id}"
    elif content_type == "preference":
        # Preferences like 'movie' or 'game' content type don't have embeddings
        raise ValueError(f"Preference item {content_id} has no direct embedding.")
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

def get_recommendations(db: Session, source_id: str, source_type: str, target_types: List[str] = None, limit: int = 5):
    """Calculates cross-recommendations using cosine similarity & popularity.

    target_types: a list of content types to filter by, e.g. ['game', 'song'].
      - None or ['all'] means all categories with diversity balancing.
      - Multiple specific types (e.g. ['game', 'song']) balance across those types only.
      - Single type (e.g. ['movie']) returns results from only that category.
    """
    if not target_types or "all" in target_types:
        filter_types = None  # no filter — include everything
    else:
        filter_types = target_types

    # 1. Fetch source vector
    source_vector = get_or_create_embedding(db, str(source_id), source_type)

    # 2. Get target candidates from the DB
    query = db.query(ContentEmbedding)
    if filter_types:
        query = query.filter(ContentEmbedding.content_type.in_(filter_types))
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

    # 4. Diversity balancing
    # Apply when: all categories selected, OR multiple specific types selected
    apply_balancing = (filter_types is None) or (len(filter_types) > 1)

    if apply_balancing:
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
        for t in active_types:
            balanced.extend(per_type[t][:base_per_type])

        # Fill remaining slots with best overall scores not yet included
        already_selected = {(i["type"], i["id"]) for i in balanced}
        remaining_slots = limit - len(balanced)

        if remaining_slots > 0:
            overflow_pool = [
                item for item in scored_items
                if (item["type"], item["id"]) not in already_selected
            ]
            overflow_pool.sort(key=lambda x: x["final_score"], reverse=True)
            balanced.extend(overflow_pool[:remaining_slots])

        balanced.sort(key=lambda x: x["final_score"], reverse=True)
        top_candidates = balanced[:limit]
    else:
        # Single type selected — plain sort, no balancing needed
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

def search_and_recommend(db: Session, query_text: str, source_type: Optional[str] = None, target_types: List[str] = None, limit: int = 5):
    """Resolves a query to a database item using a 4-stage pipeline:
      Stage 1: Substring title & title+artist match in local DB
      Stage 2: Levenshtein fuzzy match in local DB
      Stage 3: External API Fallback (TMDB, Last.fm, RAWG, Google Books)
      Stage 4: Semantic vector cosine similarity for abstract concept queries
    
    source_type: optional filter to narrow search to a specific type (movie/song/game/book).
    """
    
    # Collect items from the DB with display titles and searchable full strings
    # Entry format: (item_id, item_type, primary_title, full_searchable_string)
    all_items = []
    if not source_type or source_type == "movie":
        for m in db.query(Movie).all():
            all_items.append((str(m.movie_id), "movie", m.movie_title, m.movie_title.lower()))
    if not source_type or source_type == "song":
        for s in db.query(Song).all():
            full_str = f"{s.song_title} by {s.song_artist}".lower()
            all_items.append((str(s.song_id), "song", s.song_title, full_str))
            all_items.append((str(s.song_id), "song", s.song_title, s.song_title.lower()))
    if not source_type or source_type == "game":
        for g in db.query(Game).all():
            all_items.append((str(g.game_id), "game", g.game_title, g.game_title.lower()))
    if not source_type or source_type == "book":
        for b in db.query(Book).all():
            all_items.append((str(b.book_id), "book", b.book_title, b.book_title.lower()))

    query_lower = query_text.lower().strip()
    # Extract title portion if query contains " by " (e.g. "Frozen Heart by 8bitit")
    title_only_query = query_lower.split(" by ")[0].strip() if " by " in query_lower else query_lower

    resolved_id = None
    resolved_type = None
    match_score = 0.0

    # --- Stage 1a: Exact Title Match in local DB ---
    if all_items:
        for item_id, item_type, title, searchable in all_items:
            t_low = title.lower()
            if query_lower == t_low or query_lower == searchable or title_only_query == t_low:
                resolved_id = item_id
                resolved_type = item_type
                match_score = 100.0
                break

    # --- Stage 1b: Substring Match in local DB ---
    if not resolved_id and all_items:
        for item_id, item_type, title, searchable in all_items:
            t_low = title.lower()
            # Ensure query_lower or title_only_query is a substring and covers significant portion
            if (query_lower in searchable or title_only_query in t_low) and len(title_only_query) >= 0.5 * len(t_low):
                resolved_id = item_id
                resolved_type = item_type
                match_score = 100.0
                break

    # --- Stage 2: Levenshtein fuzzy match in local DB (catches typos like 'intersteller' -> 'interstellar') ---
    if not resolved_id and all_items:
        best_ratio = 0.0
        best_item = None
        for item_id, item_type, title, searchable in all_items:
            t_low = title.lower()
            r1 = Levenshtein.ratio(query_lower, t_low)
            r2 = Levenshtein.ratio(title_only_query, t_low)
            ratio = max(r1, r2)
            if ratio > best_ratio:
                best_ratio = ratio
                best_item = (item_id, item_type)
        
        # Cutoff 0.80 correctly separates real typos (0.91) from distinct titles sharing a word (0.76)
        if best_item and best_ratio >= 0.80:
            resolved_id, resolved_type = best_item
            match_score = round(best_ratio * 100, 1)

    # --- Stage 3: External API Fallback (Item NOT in local DB) ---
    # Search external APIs (TMDB, Last.fm, RAWG, Google Books) to find real item
    if not resolved_id:
        fallback = search_external_apis(db, query_text, source_type)
        if not fallback and title_only_query != query_lower:
            # Try fallback with title portion if query had "by ..."
            fallback = search_external_apis(db, title_only_query, source_type)
        if fallback:
            resolved_id, resolved_type = fallback
            get_or_create_embedding(db, resolved_id, resolved_type)
            match_score = 100.0

    # --- Stage 4: Semantic Embedding Fallback (catches abstract concept queries) ---
    # Only if local DB and external APIs found no named item
    if not resolved_id:
        query_vector = get_model().encode(query_text).tolist()
        query_arr = np.array(query_vector)

        emb_query = db.query(ContentEmbedding)
        if source_type:
            emb_query = emb_query.filter(ContentEmbedding.content_type == source_type)
        all_embeddings = emb_query.all()

        if all_embeddings:
            best_match = None
            best_similarity = -1.0

            for cand in all_embeddings:
                cand_arr = np.array(cand.embedding)
                dot_product = np.dot(query_arr, cand_arr)
                norm_q = np.linalg.norm(query_arr)
                norm_c = np.linalg.norm(cand_arr)
                similarity = float(dot_product / (norm_q * norm_c)) if norm_q and norm_c else 0.0

                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = cand

            if best_match and best_similarity >= 0.35:
                resolved_id = best_match.content_id
                resolved_type = best_match.content_type
                match_score = round(best_similarity * 100, 1)

    if not resolved_id:
        return None

    meta = resolve_metadata(db, resolved_id, resolved_type)

    recs = get_recommendations(
        db=db,
        source_id=resolved_id,
        source_type=resolved_type,
        target_types=target_types,
        limit=limit
    )

    return {
        "matched_item": {
            "id": resolved_id,
            "type": resolved_type,
            "title": meta["title"],
            "cover_path": meta["cover_path"],
            "match_score": match_score
        },
        "recommendations": recs
    }