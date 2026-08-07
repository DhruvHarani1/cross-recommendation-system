import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("IGDB_CLIENT_ID")
CLIENT_SECRET = os.getenv("IGDB_CLIENT_SECRET")
BASE_URL = "https://api.igdb.com/v4"
AUTH_URL = "https://id.twitch.tv/oauth2/token"

# Global token cache
_token = None
_token_expiry = 0

def get_token():
    global _token, _token_expiry
    if _token and time.time() < _token_expiry:
        return _token
        
    if not CLIENT_ID or not CLIENT_SECRET:
        raise ValueError("IGDB_CLIENT_ID and IGDB_CLIENT_SECRET must be set in .env")

    params = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    response = requests.post(AUTH_URL, params=params)
    response.raise_for_status()
    data = response.json()
    
    _token = data["access_token"]
    _token_expiry = time.time() + data.get("expires_in", 3600) - 300 # Buffer of 5 mins
    return _token

def get_headers():
    return {
        "Client-ID": CLIENT_ID,
        "Authorization": f"Bearer {get_token()}",
        "Accept": "application/json"
    }

def fetch_games(offset: int = 0, limit: int = 500):
    url = f"{BASE_URL}/games"
    # We fetch id, name, cover, genres, summary, and keywords in one go
    # Sorting by rating_count desc to get the most popular games
    query = f"""
    fields id, name, cover.url, genres.name, summary, keywords.name;
    where cover != null & genres != null;
    sort rating_count desc;
    limit {limit};
    offset {offset};
    """
    
    response = requests.post(
        url,
        headers=get_headers(),
        data=query,
        timeout=30
    )
    
    response.raise_for_status()
    return response.json()


def parse_games(raw_games):
    games = []
    
    for game in raw_games:
        # IGDB cover urls start with //, we need to add https:
        # Also let's replace t_thumb with t_cover_big for high quality
        cover_url = ""
        if game.get("cover") and game["cover"].get("url"):
            cover_url = "https:" + game["cover"]["url"].replace("t_thumb", "t_cover_big")
            
        genres = ", ".join(g["name"] for g in game.get("genres", []))
        
        keywords = []
        for kw in game.get("keywords", []):
            keywords.append(kw["name"])
            
        games.append({
            "game_id": str(game["id"]),
            "game_title": game["name"],
            "game_cover_path": cover_url,
            "game_genres": genres,
            "game_overview": game.get("summary", ""),
            "game_keywords": keywords
        })
        
    return games
    
def search_game_by_title(query: str):
    url = f"{BASE_URL}/games"
    igdb_query = f"""
    search "{query}";
    fields id, name, cover.url, genres.name, summary, keywords.name;
    where cover != null & genres != null;
    limit 1;
    """
    
    try:
        response = requests.post(url, headers=get_headers(), data=igdb_query, timeout=10)
        response.raise_for_status()
        results = response.json()
        
        if results:
            game = results[0]
            cover_url = ""
            if game.get("cover") and game["cover"].get("url"):
                cover_url = "https:" + game["cover"]["url"].replace("t_thumb", "t_cover_big")
                
            genres = ", ".join(g["name"] for g in game.get("genres", []))
            
            keywords = []
            for kw in game.get("keywords", []):
                keywords.append(kw["name"])
            
            return {
                "game_id": str(game["id"]),
                "game_title": game["name"],
                "game_cover_path": cover_url,
                "game_genres": genres,
                "game_overview": game.get("summary", ""),
                "game_keywords": keywords
            }
            
    except Exception:
        pass
        
    return None
