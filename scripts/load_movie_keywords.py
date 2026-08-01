import time
from database import SessionLocal
from services.movie_service import get_all_movies
from services.tmdb_service import fetch_movie_keywords,parse_keywords
from services.movie_keyword_service import save_keywords,get_movies_without_keywords

def load_movie_keywords():
    db = SessionLocal()

    total_inserted = 0

    try:
        movies = get_movies_without_keywords(db)

        print(f"Found {len(movies)} movies")

        for index, movie in enumerate(movies, start=1):

            print(f"\n[{index}/{len(movies)}] {movie.movie_title}")

            keywords = None

            # Retry this movie up to 3 times
            for attempt in range(3):

                try:
                    raw_keywords = fetch_movie_keywords(movie.movie_id)

                    keywords = parse_keywords(raw_keywords)

                    break

                except Exception as e:

                    print(f"Attempt {attempt + 1}/3 failed: {e}")

                    if attempt < 2:
                        print("Retrying in 5 seconds...")
                        time.sleep(5)
                    else:
                        print(f"Skipping {movie.movie_title}")

            if keywords is None:
                continue

            if not keywords:
                print(f"{movie.movie_title} has no keywords on TMDB.")
                continue

            try:
                inserted = save_keywords(
                    db,
                    movie.movie_id,
                    keywords
                )

                total_inserted += inserted

                print(f"Inserted {inserted} keywords")

            except Exception as e:
                print(f"Database error: {e}")
                db.rollback()

            # Small delay to avoid hitting the API too quickly
            time.sleep(0.5)

        print(f"\nTotal keywords inserted: {total_inserted}")

    finally:
        db.close()


if __name__ == "__main__":
    load_movie_keywords()