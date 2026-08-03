import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("RAWG_API_KEY")
BASE_URL = "https://api.rawg.io/api"


def validate_api_key():
    if not API_KEY:
        raise ValueError("You have not a valid RAWG API key")


def fetch_games(page: int = 1):
    validate_api_key()

    url = f"{BASE_URL}/games"

    params = {
        "key": API_KEY,
        "page": page,
        "page_size": 40
    }

    response = requests.get(
        url,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    return response.json()["results"]


def parse_games(raw_games):
    games = []

    for game in raw_games:

        if game.get("background_image") is None:
            continue

        genres = ", ".join(
            genre["name"] for genre in game.get("genres", [])
        )

        games.append(
            {
                "game_id": str(game["id"]),
                "game_title": game["name"],
                "game_cover_path": game["background_image"],
                "game_genres": genres
            }
        )

    return games


def fetch_game_details(game_id: str):
    validate_api_key()

    url = f"{BASE_URL}/games/{game_id}"

    params = {
        "key": API_KEY
    }

    response = requests.get(
        url,
        params=params,
        timeout=20
    )

    response.raise_for_status()

    return response.json()


def parse_game_keywords(raw_game):
    keywords = []

    for tag in raw_game.get("tags", []):
        keywords.append(tag["name"])

    return keywords


def search_game_by_title(query: str):
    """Search RAWG for a game by title. Returns parsed game dict or None."""
    validate_api_key()

    url = f"{BASE_URL}/games"
    params = {
        "key": API_KEY,
        "search": query,
        "page_size": 5
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        results = response.json().get("results", [])
    except requests.exceptions.RequestException:
        return None

    for game in results:
        if game.get("background_image"):
            genres = ", ".join(g["name"] for g in game.get("genres", []))
            return {
                "game_id": str(game["id"]),
                "game_title": game["name"],
                "game_cover_path": game["background_image"],
                "game_genres": genres
            }
    return None