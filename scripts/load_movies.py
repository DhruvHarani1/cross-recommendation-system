import time

from database import SessionLocal
from services.tmdb_service import fetch_movie, parse_movies
from services.movie_service import save_movies


def load_movies(start_page: int = 26, total_pages: int = 60):
    db = SessionLocal()

    total_inserted = 0

    try:
        for page in range(start_page, total_pages + 1):

            print(f"\nFetching page {page}...")

            raw_movies = None

            for attempt in range(3):
                try:
                    raw_movies = fetch_movie(page)
                    break

                except Exception as e:
                    print(f"Attempt {attempt + 1}/3 failed: {e}")

                    if attempt < 2:
                        print("Retrying in 5 seconds...")
                        time.sleep(5)
                    else:
                        print(f"Skipping page {page}")

            if raw_movies is None:
                continue

            movies = parse_movies(raw_movies)

            inserted = save_movies(db, movies)

            total_inserted += inserted

            print(f"Inserted {inserted} movies.")

            time.sleep(1)

        print(f"\nTotal movies inserted: {total_inserted}")

    finally:
        db.close()


if __name__ == "__main__":
    load_movies(start_page=26, total_pages=60)