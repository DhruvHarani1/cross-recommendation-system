import logging
import os 
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv('API_KEY_MOVIES')
BASE_URL = "https://api.themoviedb.org/3"

def validate_api_key():
    if not API_KEY:
        raise ValueError("you have not a valid api key")
    

def fetch_movie(page:int=1):
    validate_api_key()
    url = f"{BASE_URL}/discover/movie"
    
    params = {
        "api_key": API_KEY,
        "page": page,
        "sort_by": "popularity.desc"
    }
    response = requests.get(
        url,
        params=params,
        timeout=10
    )
    
    response.raise_for_status()
    
    return response.json()["results"]

def parse_movie(raw_movies):
    movies = []
    
    for movie in raw_movies:
        
        if movie.get("poster_path") is None:
            continue
        
        movies.append(
            {
                "movie_id":movie['id'],
                "movie_title":movie['original_title'],
                "movie_overview":movie['overview'],
                "movie_poster_path":movie['poster_path']
            }
        )
        
    return movies