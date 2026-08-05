import os
import time
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

_access_token = None
_token_expiry = 0

def get_spotify_token():
    global _access_token, _token_expiry
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        return None
        
    if time.time() < _token_expiry:
        return _access_token

    auth_string = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + auth_base64,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}

    try:
        res = requests.post(url, headers=headers, data=data, timeout=10)
        res.raise_for_status()
        token_data = res.json()
        _access_token = token_data["access_token"]
        _token_expiry = time.time() + token_data["expires_in"] - 60
        return _access_token
    except Exception:
        return None

def search_song_by_title(query: str):
    """Search Spotify for a song by query. Returns parsed song dict or None."""
    token = get_spotify_token()
    if not token:
        return None
        
    try:
        url = "https://api.spotify.com/v1/search"
        headers = {"Authorization": f"Bearer {token}"}
        params = {"q": query, "type": "track", "limit": 1}
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        results = response.json().get("tracks", {}).get("items", [])
        
        if not results:
            return None
            
        track = results[0]
        
        cover_path = ""
        images = track.get("album", {}).get("images", [])
        if images:
            cover_path = images[0].get("url", "")
            
        return {
            "song_id": track.get("id"),
            "song_title": track.get("name"),
            "song_artist": track.get("artists", [{}])[0].get("name", ""),
            "song_cover_path": cover_path
        }
    except requests.exceptions.RequestException:
        return None

def fetch_song_tags(artist: str, track: str):
    return []

def fetch_artist_tags(artist: str):
    return []

def parse_keywords(raw_tags):
    return []
