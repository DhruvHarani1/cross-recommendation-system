import sys
import os
import math
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import (
    ContentEmbedding,
    MovieKeyword,
    BookKeyword,
    SongKeyword,
    GameKeyword
)
from sqlalchemy import func

def recalculate_popularity():
    db = SessionLocal()
    try:
        print("Fetching keyword counts from all tables...")
        
        # 1. Fetch keyword counts per content type
        movie_counts = {
            r[0]: r[1] for r in db.query(MovieKeyword.movie_id, func.count(MovieKeyword.id))
            .group_by(MovieKeyword.movie_id).all()
        }
        
        book_counts = {
            r[0]: r[1] for r in db.query(BookKeyword.book_id, func.count(BookKeyword.id))
            .group_by(BookKeyword.book_id).all()
        }
        
        song_counts = {
            r[0]: r[1] for r in db.query(SongKeyword.song_id, func.count(SongKeyword.id))
            .group_by(SongKeyword.song_id).all()
        }
        
        game_counts = {
            r[0]: r[1] for r in db.query(GameKeyword.game_id, func.count(GameKeyword.id))
            .group_by(GameKeyword.game_id).all()
        }
        
        # Merge counts into a single lookup dict mapping (type, id) -> count
        counts = {}
        for mid, c in movie_counts.items():
            counts[("movie", str(mid))] = c
        for bid, c in book_counts.items():
            counts[("book", str(bid))] = c
        for sid, c in song_counts.items():
            counts[("song", str(sid))] = c
        for gid, c in game_counts.items():
            counts[("game", str(gid))] = c

        # Find maximum keyword count to establish normalisation ceiling
        max_count = max(counts.values()) if counts else 1
        print(f"Ceiling keyword count found: {max_count}")

        # 2. Fetch all embeddings and update popularity scores
        embeddings = db.query(ContentEmbedding).all()
        print(f"Updating {len(embeddings)} content embeddings...")
        
        updated_count = 0
        for emb in embeddings:
            key = (emb.content_type, emb.content_id)
            kw_count = counts.get(key, 0)
            
            # Apply logarithmic scaling to project counts into a 30 to 100 range
            if kw_count <= 0:
                popularity = 30.0
            else:
                popularity = 30.0 + 70.0 * (math.log(1 + kw_count) / math.log(1 + max_count))
            
            emb.popularity_score = round(popularity, 2)
            updated_count += 1
            
            if updated_count % 500 == 0:
                print(f"Processed {updated_count}/{len(embeddings)}...")

        db.commit()
        print(f"Success! Updated {updated_count} embeddings with calculated popularity scores.")
        
    except Exception as e:
        db.rollback()
        print(f"Error executing popularity recalculation: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    recalculate_popularity()
