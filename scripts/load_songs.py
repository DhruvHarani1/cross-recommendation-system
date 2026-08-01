from database import SessionLocal

from services.lastfm_service import (
    fetch_songs,
    parse_songs,
    SONG_TAGS
)

from services.song_service import save_songs


def load_songs(pages_per_tag: int = 2):

    db = SessionLocal()

    total_inserted = 0

    try:

        for tag in SONG_TAGS:

            print(f"\nFetching songs tagged: {tag}")

            for page in range(1, pages_per_tag + 1):

                raw_songs = fetch_songs(tag=tag, page=page)

                if not raw_songs:
                    print(f"No more results for '{tag}' at page {page}.")
                    break

                songs = parse_songs(raw_songs)

                inserted = save_songs(db, songs)

                total_inserted += inserted

                print(f"Page {page} | Inserted: {inserted}")

        print(f"\nTotal songs inserted: {total_inserted}")

    finally:
        db.close()


if __name__ == "__main__":
    load_songs()