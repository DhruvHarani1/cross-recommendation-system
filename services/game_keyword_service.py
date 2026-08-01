from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from models import Game, GameKeyword


def save_keywords(db: Session, game_id: str, keywords: list[str]):

    inserted_keywords = 0

    for keyword in keywords:

        existing_keyword = (
            db.query(GameKeyword)
            .filter(
                GameKeyword.game_id == game_id,
                GameKeyword.keyword == keyword
            )
            .first()
        )

        if existing_keyword:
            continue

        new_keyword = GameKeyword(
            game_id=game_id,
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


def get_games_without_keywords(db: Session):
    return (
        db.query(Game)
        .outerjoin(GameKeyword, Game.game_id == GameKeyword.game_id)
        .filter(GameKeyword.game_id == None)
        .all()
    )