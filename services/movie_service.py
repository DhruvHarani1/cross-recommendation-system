from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models import Movie

def save_movies(db:Session,movies):
    inserted_movies=0
    
    for movie in movies:
        existing_movie = db.get(Movie,movie['movie_id'])
        
        if existing_movie:
            continue
        
        new_movie = Movie(
            movie_id = movie["movie_id"],
            movie_title = movie["movie_title"],
            movie_overview = movie['movie_overview'],
            movie_poster_path = movie["movie_poster_path"]
        )
        
        db.add(new_movie)
        inserted_movies += 1
        
    try:
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise

    return inserted_movies

def get_all_movies(db:Session):
    return db.query(Movie).all()