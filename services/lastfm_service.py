import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('LASTFM_API_KEY')
BASE_URL = "https://ws.audioscrobbler.com/2.0/"

# Mix of language/genre tags so we don't just get one country's chart.
# Last.fm tags are crowd-sourced, so these names are what listeners
# actually tag tracks with.
SONG_TAGS = [
    "bollywood",
    "hindi",
    "punjabi",
    "indian",
    "hollywood",
    "pop",
    "rock",
    "hip hop",
    "rnb",
    "romantic"
]


def validate_api_key():
    if not API_KEY:
        raise ValueError("you have not a valid api key")


def fetch_songs(tag: str, page: int = 1, limit: int = 50):
    validate_api_key()

    params = {
        "method": "tag.gettoptracks",
        "tag": tag,
        "page": page,
        "limit": limit,
        "api_key": API_KEY,
        "format": "json"
    }

    response = requests.get(
        BASE_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    return data.get("tracks", {}).get("track", [])


def parse_songs(raw_songs):
    songs = []

    for song in raw_songs:

        title = song.get("name")
        artist = song.get("artist", {}).get("name")

        if not title or not artist:
            continue

        # Last.fm's image field is unreliable (mostly returns a
        # placeholder star image now), so we leave cover_path empty
        # here. It gets filled in separately via iTunes.
        songs.append(
            {
                "song_id": f"{artist}::{title}",
                "song_title": title,
                "song_artist": artist,
                "song_cover_path": ""
            }
        )

    return songs


def fetch_song_tags(artist: str, track: str):
    validate_api_key()

    params = {
        "method": "track.gettoptags",
        "artist": artist,
        "track": track,
        "autocorrect": 1,
        "api_key": API_KEY,
        "format": "json"
    }

    response = requests.get(
        BASE_URL,
        params=params,
        timeout=20
    )

    response.raise_for_status()

    return response.json()

def fetch_artist_tags(artist: str):
    validate_api_key()

    params = {
        "method": "artist.gettoptags",
        "artist": artist,
        "autocorrect": 1,
        "api_key": API_KEY,
        "format": "json"
    }

    response = requests.get(
        BASE_URL,
        params=params,
        timeout=20
    )

    response.raise_for_status()

    return response.json()


def parse_keywords(raw_tags):
    keywords = []

    tags = raw_tags.get("toptags", {}).get("tag", [])

    for tag in tags:
        keywords.append(tag["name"])

    return keywords


def search_song_by_title(query: str):
    """Search Last.fm for a song by title or 'Title by Artist'. Returns parsed song dict or None."""
    validate_api_key()

    params = {
        "method": "track.search",
        "track": query,
        "api_key": API_KEY,
        "format": "json",
        "limit": 5
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        tracks = data.get("results", {}).get("trackmatches", {}).get("track", [])
    except requests.exceptions.RequestException:
        return None

    for track in tracks:
        name = track.get("name")
        artist = track.get("artist")

        if not name or not artist:
            continue

        # Get cover image if available
        cover_path = ""
        images = track.get("image", [])
        for img in reversed(images):
            text = img.get("#text")
            if text:
                cover_path = text
                break

        return {
            "song_id": f"{artist}::{name}",
            "song_title": name,
            "song_artist": artist,
            "song_cover_path": cover_path
        }
    return None