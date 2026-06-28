from database import SessionLocal
from services.movie_service import get_all_movies
from services.tmdb_service import fetch_movie_keywords,parse_keywords
from services.keyword_service import save_keywords,get_movies_without_keywords

def load_keywords():
    db = SessionLocal()
    
    total_inserted = 0
    
    movies = get_movies_without_keywords(db)

    print(f"Found {len(movies)} movies")
    
    for index, movie in enumerate(movies, start=1):

        try:
            print(f"[{index}/{len(movies)}] {movie.movie_title}")

            raw_keywords = fetch_movie_keywords(movie.movie_id)

            keywords = parse_keywords(raw_keywords)
            
            if not keywords:
                print(f"{movie.movie_title} has no keywords on TMDB.")
                continue

            inserted = save_keywords(
                db,
                movie.movie_id,
                keywords
            )

            total_inserted += inserted

            print(f"Inserted {inserted} keywords")

        except Exception as e:
            print(f"Failed for movie {movie.movie_title}: {e}")
            continue
        
        
if __name__ == "__main__":
    load_keywords()