from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models import MovieKeyword,Movie

def save_keywords(db:Session,movie_id:int,keywords:list[str]):
    
    inserted_keywords = 0
    
    for keyword in keywords:
        
        existing_keyword = (
            db.query(MovieKeyword)
            .filter(
                MovieKeyword.movie_id == movie_id,
                MovieKeyword.keyword == keyword
            )
            .first()
        )
        
        if existing_keyword:
            continue
        
        new_keyword = MovieKeyword(
            movie_id = movie_id,
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


def get_movies_without_keywords(db: Session):
    return (
        db.query(Movie)
        .outerjoin(MovieKeyword, Movie.movie_id == MovieKeyword.movie_id)
        .filter(MovieKeyword.movie_id == None)
        .all()
    )