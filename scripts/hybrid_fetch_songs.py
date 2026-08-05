import os
import sys
import requests
import time
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import Song, SongKeyword
from services.lastfm_service import (
    SONG_TAGS, fetch_songs, fetch_song_tags, fetch_artist_tags, parse_keywords
)
from services.recommendation_service import get_or_create_embedding

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

def main():
    db = SessionLocal()
    target_count = 10000
    
    print(f"Starting Hybrid Fetcher. Target: {target_count} songs.")
    
    # O(1) instant lookup cache
    existing_ids = {str(m[0]) for m in db.query(Song.song_id).all()}
    inserted = len(existing_ids)
    print(f"Found {inserted} existing songs in database.")
    
    try:
        for tag in SONG_TAGS:
            if inserted >= target_count:
                break
                
            print(f"\\n--- Fetching Tag: {tag} ---")
            page = 1
            consecutive_empty_pages = 0
            
            while inserted < target_count:
                # Fetch tracks from Last.fm
                try:
                    raw_songs = fetch_songs(tag=tag, page=page, limit=50)
                except Exception as e:
                    print(f"Error fetching page {page} for tag {tag}: {e}")
                    break
                    
                if not raw_songs:
                    consecutive_empty_pages += 1
                    if consecutive_empty_pages > 3:
                        break
                    page += 1
                    continue
                else:
                    consecutive_empty_pages = 0

                # Prevent infinite loops on obscure tracks without covers
                if page > 20:
                    print(f"Reached page limit (20) for {tag}, moving to next tag.")
                    break

                for song in raw_songs:
                    if inserted >= target_count:
                        break
                        
                    title = song.get("name")
                    artist = song.get("artist", {}).get("name")
                    
                    if not title or not artist:
                        continue
                        
                    song_id = f"{artist}::{title}"
                    
                    # 1. Check if already in DB in O(1)
                    if song_id in existing_ids:
                        continue
                        
                    # 2. Hybrid Fetch: Get Cover from iTunes
                    cover_url = fetch_itunes_cover(title, artist)
                    if not cover_url:
                        # Skip this song completely! We ONLY want songs with covers.
                        continue
                        
                    # 3. Hybrid Fetch: Get Tags from Last.fm
                    try:
                        raw_tags = fetch_song_tags(artist, title)
                        keywords = parse_keywords(raw_tags)
                        
                        # Fallback to artist tags if song has none
                        if not keywords:
                            raw_tags = fetch_artist_tags(artist)
                            keywords = parse_keywords(raw_tags)
                    except Exception:
                        continue
                        
                    if not keywords:
                        continue
                        
                    # 4. Save to Database
                    new_song = Song(
                        song_id=song_id,
                        song_title=title,
                        song_artist=artist,
                        song_cover_path=cover_url
                    )
                    db.add(new_song)
                    existing_ids.add(song_id)
                    
                    for kw in keywords[:10]: # Max 10 keywords
                        db.add(SongKeyword(song_id=song_id, keyword=kw.lower()))
                        
                    db.commit()
                    
                    # 5. Generate Embedding
                    try:
                        get_or_create_embedding(db, song_id, "song")
                        db.commit()
                        inserted += 1
                        if inserted % 100 == 0:
                            print(f"[{inserted}/{target_count}] Successfully inserted & embedded '{title}' by {artist}")
                    except Exception as e:
                        print(f"Error embedding {song_id}: {e}")
                        db.rollback()

                page += 1
                time.sleep(1) # Be nice to the APIs
                
        print(f"\\nSuccess! Inserted {inserted} songs with covers and tags.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
