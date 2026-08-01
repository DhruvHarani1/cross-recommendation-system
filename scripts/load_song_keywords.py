from database import SessionLocal
from services.song_service import get_all_songs
from services.lastfm_service import fetch_song_tags, fetch_artist_tags, parse_keywords
from services.song_keyword_service import save_keywords, get_songs_without_keywords


def load_song_keywords():
    db = SessionLocal()

    total_inserted = 0
    fallback_used = 0
    still_empty = 0

    songs = get_songs_without_keywords(db)

    print(f"Found {len(songs)} songs")

    for index, song in enumerate(songs, start=1):

        try:
            print(f"[{index}/{len(songs)}] {song.song_title}")

            raw_tags = fetch_song_tags(song.song_artist, song.song_title)

            keywords = parse_keywords(raw_tags)

            if not keywords:
                raw_artist_tags = fetch_artist_tags(song.song_artist)
                keywords = parse_keywords(raw_artist_tags)

                if keywords:
                    fallback_used += 1

            if not keywords:
                print(f"{song.song_title} has no tags on Last.fm (track or artist).")
                still_empty += 1
                continue

            inserted = save_keywords(
                db,
                song.song_id,
                keywords
            )

            total_inserted += inserted

            print(f"Inserted {inserted} keywords")

        except Exception as e:
            print(f"Failed for song {song.song_title}: {e}")
            continue

    print(f"\nTotal keywords inserted: {total_inserted}")
    print(f"Songs that needed the artist-level fallback: {fallback_used}")
    print(f"Songs still with zero keywords: {still_empty}")


if __name__ == "__main__":
    load_song_keywords()