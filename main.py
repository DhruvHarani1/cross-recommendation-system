from fastapi import FastAPI

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


from database import SessionLocal
from models import Movie

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
    movie_api_id=movie_data["id"],
    title=movie_data["title"],
    release_date=movie_data["release_date"],
    rating=movie_data["vote_average"],
    overview=movie_data["overview"]
)

db.add(movie)

db.commit()

db.close()