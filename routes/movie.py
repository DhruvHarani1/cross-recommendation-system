from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Movie
from schemas.movie import MovieCreate

router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)

@router.post("/")
def create_movie(movie:MovieCreate,db:Session = Depends(get_db)):
    
    existing_movie = db.get(Movie,movie.movie_id)
    
    if existing_movie:
        raise HTTPException(
            status_code=409,
            detail="Movie already exists."
        )
    
    new_movie = Movie(
       movie_id = movie.movie_id,
       movie_title = movie.movie_title,
       movie_overview = movie.movie_overview,
       movie_poster_path = movie.movie_poster_path
    )
    
    try:
        db.add(new_movie)
        db.commit()
        db.refresh(new_movie)

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Database Error : {str(e)}"
        )
    
    return {
        "message": "Movie added successfully",
        "movie": new_movie
    }