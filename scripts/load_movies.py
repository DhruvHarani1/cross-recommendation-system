from database import SessionLocal
from services.tmdb_service import fetch_movies, parse_movies
from services.movie_service import save_movies


def load_movies(total_pages: int = 10):
    db = SessionLocal()

    total_inserted = 0

    try:
        for page in range(1, total_pages + 1):

            print(f"\nFetching page {page}...")

            raw_movies = fetch_movies(page)

            movies = parse_movies(raw_movies)

            inserted = save_movies(db, movies)

            total_inserted += inserted

            print(f"Inserted {inserted} movies.")

        print(f"\nTotal movies inserted: {total_inserted}")

    finally:
        db.close()


if __name__ == "__main__":
    load_movies()