from database import SessionLocal
import time
from services.rawg_service import fetch_games, parse_games
from services.game_service import save_games


def load_games(total_pages: int = 25):

    db = SessionLocal()

    total_inserted = 0

    try:
        
        for page in range(1, total_pages + 1):

            print(f"\nFetching page {page}...")

            raw_games = fetch_games(page)

            games = parse_games(raw_games)

            inserted = save_games(db, games)

            total_inserted += inserted

            print(f"Inserted {inserted} games.")
            
            # Be nice to the API, sleep for a short duration between pages
            time.sleep(0.5)

        print(f"\nTotal games inserted: {total_inserted}")

    finally:
        db.close()


if __name__ == "__main__":
    load_games()