from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models import SongKeyword, Song
from services.lastfm_service import fetch_song_tags, fetch_artist_tags, parse_keywords


def save_keywords(db: Session, song_id: str, keywords: list[str]):

    inserted_keywords = 0

    for keyword in keywords:

        existing_keyword = (
            db.query(SongKeyword)
            .filter(
                SongKeyword.song_id == song_id,
                SongKeyword.keyword == keyword
            )
            .first()
        )

        if existing_keyword:
            continue

        new_keyword = SongKeyword(
            song_id=song_id,
            keyword=keyword
        )

        db.add(new_keyword)
        inserted_keywords += 1

    try:
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise

    return inserted_keywords


def get_songs_without_keywords(db: Session):
    return (
        db.query(Song)
        .outerjoin(SongKeyword, Song.song_id == SongKeyword.song_id)
        .filter(SongKeyword.song_id == None)
        .all()
    )