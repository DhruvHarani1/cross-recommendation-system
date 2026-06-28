from fastapi import APIRouter

from database import SessionLocal
from models import Movie

router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)


@router.get("/search/{movie_name}")
def search_movie(movie_name: str):
    # get movies for testing
    return {
        "movie_name": movie_name
    }


@router.post("/store/{store_size}")
def store_movies(store_size: int):
    return {
        # store movies to postgres 
        "message": f"Store {store_size} movies"
    }

#ONLY EXAMPLE (IN FUTHER: REPLACED WITH EXTRAL API RESULT)
@router.post("/test")
def test_insert():

    movie_data = {
        "id": 10,
        "title": "Fight Club",
    }

    db = SessionLocal()

    try:
        movie = Movie(
            movie_id=movie_data["id"],
            movie_title=movie_data["title"],
        )

        db.add(movie)
        db.commit()

    finally:
        db.close()

    return {"message": "Movie inserted"}