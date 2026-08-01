from database import SessionLocal

from services.game_keyword_service import (
    save_keywords,
    get_games_without_keywords,
)
from services.rawg_service import (
    fetch_game_details,
    parse_game_keywords,
)

def load_keywords():

    db = SessionLocal()

    total_inserted = 0

    try:
        games = get_games_without_keywords(db)

        print(f"Found {len(games)} games")

        for index, game in enumerate(games, start=1):

            try:
                print(f"[{index}/{len(games)}] {game.game_title}")

                raw_game = fetch_game_details(game.game_id)

                keywords = parse_game_keywords(raw_game)

                if not keywords:
                    print(f"{game.game_title} has no keywords.")
                    continue

                inserted = save_keywords(
                    db,
                    game.game_id,
                    keywords
                )

                total_inserted += inserted

                print(f"Inserted {inserted} keywords")

            except Exception as e:
                print(f"Failed for game {game.game_title}: {e}")
                continue

        print(f"\nTotal keywords inserted: {total_inserted}")

    finally:
        db.close()

if __name__ == "__main__":
    load_keywords()