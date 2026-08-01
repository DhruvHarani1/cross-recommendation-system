from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from models import Game


def save_games(db: Session, games):
    inserted_games = 0

    for game in games:
        existing_game = db.get(Game, game["game_id"])

        if existing_game:
            continue

        new_game = Game(
            game_id=game["game_id"],
            game_title=game["game_title"],
            game_cover_path=game["game_cover_path"],
            game_genres=game["game_genres"]
        )

        db.add(new_game)
        inserted_games += 1

    try:
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise

    return inserted_games


def get_all_games(db: Session):
    return db.query(Game).all()