from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models import Song


def save_songs(db: Session, songs):
    inserted_songs = 0

    for song in songs:
        existing_song = db.get(Song, song["song_id"])

        if existing_song:
            continue

        new_song = Song(
            song_id=song["song_id"],
            song_title=song["song_title"],
            song_artist=song["song_artist"],
            song_cover_path=song["song_cover_path"]
        )

        db.add(new_song)
        inserted_songs += 1

    try:
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise

    return inserted_songs


def get_all_songs(db: Session):
    return db.query(Song).all()