from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.movie import router as movie_router
from routes.recommendation import router as recommendation_router
from routes.personalization import router as personalization_router
from routes.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from database import engine, Base
import models  # noqa: F401 — register all SQLAlchemy models with Base

Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(auth_router)
app.include_router(movie_router)
app.include_router(recommendation_router)
app.include_router(personalization_router)