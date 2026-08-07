import time
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import Movie, MovieKeyword
from services.tmdb_service import fetch_movie, parse_movies, fetch_movie_keywords, parse_keywords
from services.recommendation_service import get_or_create_embedding

def load_movies():
    db = SessionLocal()
    target_count = 10000
    inserted = 0
    page = 1
    
    print(f"Starting Movie Fetcher. Target: {target_count} movies.")
    
    # Pre-fetch existing IDs for instant fast-forwarding
    existing_ids = {m[0] for m in db.query(Movie.movie_id).all()}
    inserted = len(existing_ids)
    print(f"Found {inserted} existing movies in database.")
    
    try:
        while inserted < target_count:
            # TMDB maximum page limit check (usually 500 max without pagination tokens)
            if page > 500:
                print("Hit TMDB 500 page limit.")
                break
                
            raw_movies = None
            for attempt in range(3):
                try:
                    raw_movies = fetch_movie(page)
                    break
                except Exception as e:
                    print(f"Attempt {attempt + 1}/3 failed: {e}")
                    time.sleep(2)
            
            if not raw_movies:
                page += 1
                continue
                
            movies = parse_movies(raw_movies)
            
            for m_data in movies:
                if inserted >= target_count:
                    break
                    
                movie_id = str(m_data["movie_id"])
                
                # Check if already exists in O(1) time
                if movie_id in existing_ids:
                    continue
                
                # Fetch Keywords
                keywords = []
                try:
                    raw_kws = fetch_movie_keywords(movie_id)
                    keywords = parse_keywords(raw_kws)
                except Exception as e:
                    print(f"Failed to fetch keywords for {movie_id}: {e}")
                
                if not keywords:
                    continue # Skip if no keywords
                
                # Insert Movie
                new_movie = Movie(
                    movie_id=movie_id,
                    movie_title=m_data["movie_title"],
                    movie_overview=m_data["movie_overview"],
                    movie_poster_path=m_data["movie_poster_path"]
                )
                db.add(new_movie)
                
                # Insert Keywords
                for kw in keywords[:10]:
                    db.add(MovieKeyword(movie_id=movie_id, keyword=kw.lower()))
                    
                existing_ids.add(movie_id)
                db.commit()
                
                # Embed
                try:
                    get_or_create_embedding(db, movie_id, "movie")
                    db.commit()
                    inserted += 1
                    if inserted % 100 == 0:
                        print(f"[{inserted}/{target_count}] Successfully inserted movie '{new_movie.movie_title}'")
                except Exception as e:
                    print(f"Failed to embed {movie_id}: {e}")
                    db.rollback()
                    
            page += 1
            time.sleep(0.5) # Rate limit respect
            
        print(f"\\nTotal movies successfully inserted: {inserted}")
    finally:
        db.close()

if __name__ == "__main__":
    load_movies()