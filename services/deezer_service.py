import requests

def search_song_by_title(query: str):
    """Search Deezer for a song by query. Returns parsed song dict or None."""
    try:
        url = "https://api.deezer.com/search"
        params = {"q": query, "limit": 1}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        results = response.json().get("data", [])
        
        if not results:
            return None
            
        track = results[0]
        
        # Deezer provides high-res covers in album.cover_xl
        cover_path = track.get("album", {}).get("cover_xl", "")
            
        return {
            "song_id": str(track.get("id")),
            "song_title": track.get("title"),
            "song_artist": track.get("artist", {}).get("name", ""),
            "song_cover_path": cover_path
        }
    except requests.exceptions.RequestException:
        return None

def fetch_song_tags(artist: str, track: str):
    # Deezer does not provide rich track tags directly via search
    return []

def fetch_artist_tags(artist: str):
    return []

def parse_keywords(raw_tags):
    return []
