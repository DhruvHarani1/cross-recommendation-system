import time
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import Game, GameKeyword
from services.rawg_service import fetch_games, parse_games, fetch_game_details, parse_game_keywords
from services.recommendation_service import get_or_create_embedding

def load_games():
    db = SessionLocal()
    target_count = 10000
    inserted = 0
    page = 1
    
    print(f"Starting Game Fetcher. Target: {target_count} games.")
    
    # O(1) instant lookup cache
    existing_ids = {str(m[0]) for m in db.query(Game.game_id).all()}
    inserted = len(existing_ids)
    print(f"Found {inserted} existing games in database.")
    
    try:
        while inserted < target_count:
            if page > 250: # RAWG maxes out around 10k items with page_size 40
                print("Hit maximum page limit for RAWG.")
                break
                
            raw_games = None
            for attempt in range(3):
                try:
                    raw_games = fetch_games(page)
                    break
                except Exception as e:
                    print(f"Attempt {attempt + 1}/3 failed: {e}")
                    time.sleep(2)
            
            if not raw_games:
                page += 1
                continue
                
            games = parse_games(raw_games)
            
            for g_data in games:
                if inserted >= target_count:
                    break
                    
                game_id = str(g_data["game_id"])
                
                if game_id in existing_ids:
                    continue
                
                # Fetch Keywords
                keywords = []
                try:
                    raw_details = fetch_game_details(game_id)
                    keywords = parse_game_keywords(raw_details)
                except Exception as e:
                    print(f"Failed to fetch details for {game_id}: {e}")
                
                if not keywords:
                    continue
                
                # Insert Game
                new_game = Game(
                    game_id=game_id,
                    game_title=g_data["game_title"],
                    game_cover_path=g_data["game_cover_path"],
                    game_genres=g_data["game_genres"]
                )
                db.add(new_game)
                existing_ids.add(game_id)
                
                # Insert Keywords
                for kw in keywords[:10]:
                    db.add(GameKeyword(game_id=game_id, keyword=kw.lower()))
                    
                db.commit()
                
                # Embed
                try:
                    get_or_create_embedding(db, game_id, "game")
                    db.commit()
                    inserted += 1
                    if inserted % 100 == 0:
                        print(f"[{inserted}/{target_count}] Successfully inserted game '{new_game.game_title}'")
                except Exception as e:
                    print(f"Failed to embed {game_id}: {e}")
                    db.rollback()
                    
            page += 1
            time.sleep(0.5)
            
        print(f"\\nTotal games successfully inserted: {inserted}")
    finally:
        db.close()

if __name__ == "__main__":
    load_games()