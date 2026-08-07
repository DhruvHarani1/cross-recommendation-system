import os
import time 
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('API_KEY_MOVIES')
BASE_URL = "https://api.themoviedb.org/3"

def validate_api_key():
    if not API_KEY:
        raise ValueError("you have not a valid api key")
    

def fetch_movie(page: int = 1):
    validate_api_key()

    url = f"{BASE_URL}/discover/movie"

    params = {
        "api_key": API_KEY,
        "page": page,
        "sort_by": "revenue.desc"
    }

    headers = {
        "Accept": "application/json",
        "User-Agent": "CrossRecommendationSystem/1.0"
    }

    for attempt in range(3):
        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=20
            )

            response.raise_for_status()

            return response.json()["results"]

        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {e}")

            if attempt < 2:
                time.sleep(2)
            else:
                raise

def parse_movies(raw_movies):
    movies = []
    
    for movie in raw_movies:
        
        if movie.get("poster_path") is None:
            continue
        
        movies.append(
            {
                "movie_id":str(movie['id']),
                "movie_title":movie['original_title'],
                "movie_overview":movie['overview'],
                "movie_poster_path":movie['poster_path']
            }
        )
        
    return movies

def fetch_movie_keywords(movie_id:str):
    validate_api_key()
    
    url = f"{BASE_URL}/movie/{movie_id}/keywords"
    
    params = {
        "api_key": API_KEY
    }
    
    response = requests.get(
        url,
        params = params,
        timeout=20
    )
    
    response.raise_for_status()
    
    return response.json()



def parse_keywords(raw_keywords):
    keywords = []
    
    for keyword in raw_keywords["keywords"]:
        keywords.append(keyword["name"])
    
    return keywords


def search_movie_by_title(query: str):
    """Search TMDB for a movie by title. Returns parsed movie dict or None."""
    validate_api_key()

    url = f"{BASE_URL}/search/movie"
    params = {
        "api_key": API_KEY,
        "query": query,
        "include_adult": False,
        "language": "en-US",
        "page": 1
    }
    headers = {"Accept": "application/json", "User-Agent": "CrossRecommendationSystem/1.0"}

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        results = response.json().get("results", [])
    except requests.exceptions.RequestException:
        return None

    # Pick the first result that has a poster
    for movie in results:
        if movie.get("poster_path") and movie.get("overview"):
            return {
                "movie_id": str(movie["id"]),
                "movie_title": movie["original_title"],
                "movie_overview": movie["overview"],
                "movie_poster_path": movie["poster_path"]
            }
    return None