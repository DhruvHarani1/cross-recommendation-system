import sys
import os
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import Movie, Game, Book, Song
from services.tmdb_service import search_movie_by_title
from services.rawg_service import search_game_by_title
from services.book_service import search_book_by_title
import requests

def fetch_itunes_cover(title, artist):
    try:
        url = "https://itunes.apple.com/search"
        params = {"term": f"{title} {artist}", "entity": "song", "limit": 1}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        results = response.json().get("results", [])
        if results and results[0].get("artworkUrl100"):
            return results[0]["artworkUrl100"].replace("100x100bb.jpg", "600x600bb.jpg")
    except Exception:
        pass
    return None

def is_invalid(path):
    if not path or str(path).strip().lower() in ["", "n/a", "null", "none"]:
        return True
    
    # Check if the URL is broken (404, etc.)
    url = path
    if url.startswith("/"):
        url = f"https://image.tmdb.org/t/p/w500{url}"
        
    try:
        r = requests.head(url, timeout=5, allow_redirects=True)
        # If it's a 404, it's broken
        if r.status_code != 200:
            print(f"Broken URL ({r.status_code}): {url}")
            return True
        return False
    except Exception as e:
        print(f"Error checking URL {url}: {e}")
        return True

def fix_movies(db):
    print("Checking Movies...")
    movies = db.query(Movie).all()
    count = 0
    for m in movies:
        if is_invalid(m.movie_poster_path):
            print(f"Missing/Broken poster for Movie: {m.movie_title}")
            result = search_movie_by_title(m.movie_title)
            if result and result.get("movie_poster_path") and result.get("movie_poster_path") != m.movie_poster_path:
                m.movie_poster_path = result["movie_poster_path"]
                db.commit()
                print(f"  -> Fixed! New path: {m.movie_poster_path}")
                count += 1
            else:
                print("  -> Could not find poster.")
    print(f"Fixed {count} movies.\n")

def fix_games(db):
    print("Checking Games...")
    games = db.query(Game).all()
    count = 0
    for g in games:
        if is_invalid(g.game_cover_path):
            print(f"Missing/Broken poster for Game: {g.game_title}")
            result = search_game_by_title(g.game_title)
            if result and result.get("game_cover_path") and result.get("game_cover_path") != g.game_cover_path:
                g.game_cover_path = result["game_cover_path"]
                db.commit()
                print(f"  -> Fixed! New path: {g.game_cover_path}")
                count += 1
            else:
                print("  -> Could not find poster.")
    print(f"Fixed {count} games.\n")

def fix_books(db):
    print("Checking Books...")
    books = db.query(Book).all()
    count = 0
    for b in books:
        if is_invalid(b.book_cover_path):
            print(f"Missing/Broken poster for Book: {b.book_title}")
            result = search_book_by_title(b.book_title)
            if result and result.get("book_cover_path") and result.get("book_cover_path") != b.book_cover_path:
                b.book_cover_path = result["book_cover_path"]
                db.commit()
                print(f"  -> Fixed! New path: {b.book_cover_path}")
                count += 1
            else:
                print("  -> Could not find poster.")
    print(f"Fixed {count} books.\n")

def fix_songs(db):
    print("Checking Songs...")
    songs = db.query(Song).all()
    count = 0
    for s in songs:
        if is_invalid(s.song_cover_path):
            print(f"Missing/Broken poster for Song: {s.song_title} by {s.song_artist}")
            try:
                cover_url = fetch_itunes_cover(s.song_title, s.song_artist)
                if cover_url and cover_url != s.song_cover_path:
                    s.song_cover_path = cover_url
                    db.commit()
                    print(f"  -> Fixed! New path: {s.song_cover_path}")
                    count += 1
                else:
                    print("  -> Could not find poster.")
            except Exception as e:
                print(f"  -> Failed to search: {e}")
    print(f"Fixed {count} songs.\n")

def main():
    db = SessionLocal()
    try:
        fix_movies(db)
        fix_games(db)
        fix_books(db)
        fix_songs(db)
        print("All missing posters fixed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
