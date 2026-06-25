from fastapi import FastAPI
from database import SessionLocal
from models import Movie
app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/movies/{movie_name}")
def search_movie(movie_name: str):
    # get movies for testing
    pass
@app.get("/movies/{store_size}")
def store_movies(store_size: int):
    # store movies to postgres 
    pass

#ONLY EXAMPLE (IN FUTHER: REPLACED WITH EXTRAL API RESULT)
movie_data = {
    "id": 550,
    "title": "Fight Club",
    "release_date": "1999-10-15",
    "vote_average": 8.8,
    "overview": "An insomniac office worker..."
}

db = SessionLocal()

movie = Movie(
    movie_id=movie_data["id"],
    movie_title=movie_data["title"],
)

db.add(movie)

db.commit()

db.close()