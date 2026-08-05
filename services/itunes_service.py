import requests

def search_song_by_title(query: str):
    """Search iTunes for a song by title and artist. Returns parsed song dict or None."""
    try:
        url = "https://itunes.apple.com/search"
        params = {"term": query, "entity": "song", "limit": 1}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        results = response.json().get("results", [])
        
        if not results:
            return None
            
        track = results[0]
        
        # iTunes gives 100x100 max by default, replace to get 600x600
        cover_path = track.get("artworkUrl100", "")
        if cover_path:
            cover_path = cover_path.replace("100x100bb.jpg", "600x600bb.jpg")
            
        return {
            "song_id": str(track.get("trackId")),
            "song_title": track.get("trackName"),
            "song_artist": track.get("artistName"),
            "song_cover_path": cover_path
        }
    except requests.exceptions.RequestException:
        return None

def fetch_song_tags(artist: str, track: str):
    # iTunes does not provide rich tag data like Last.fm.
    # Return basic genre information if needed, or empty for now.
    try:
        url = "https://itunes.apple.com/search"
        params = {"term": f"{artist} {track}", "entity": "song", "limit": 1}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        results = response.json().get("results", [])
        if results:
            genre = results[0].get("primaryGenreName")
            if genre:
                return [{"name": genre.lower()}]
    except Exception:
        pass
    return []

def fetch_artist_tags(artist: str):
    # iTunes doesn't have artist tags.
    return []

def parse_keywords(raw_tags):
    keywords = []
    for tag in raw_tags:
        keywords.append(tag["name"])
    return keywords
