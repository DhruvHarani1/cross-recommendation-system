from fastapi import FastAPI
from routes.movie import router as movie_router
from routes.recommendation import router as recommendation_router
from routes.personalization import router as personalization_router
app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(movie_router)
app.include_router(recommendation_router)
app.include_router(personalization_router)