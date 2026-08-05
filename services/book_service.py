import requests
import os
from dotenv import load_dotenv

load_dotenv()

BOOKS_API_KEY = os.getenv('GOOGLE_BOOKS_API_KEY')
BASE_URL = "https://www.googleapis.com/books/v1/volumes"

BOOK_SUBJECTS = [
    "fantasy", "science fiction", "romance", "mystery", "thriller", "horror",
    "adventure", "historical fiction", "young adult", "crime", "drama",
    "dystopian", "mythology", "biography", "autobiography", "memoir",
    "self-help", "business", "economics", "investing", "psychology",
    "philosophy", "history", "politics", "sociology", "anthropology",
    "true crime", "science", "technology", "programming", "mathematics",
    "physics", "chemistry", "biology", "astronomy", "medicine",
    "health", "fitness", "cooking", "baking", "diet", "nutrition",
    "travel", "guide", "art", "photography", "architecture",
    "design", "music", "film", "theater", "dance",
    "poetry", "classics", "literature", "humor", "comedy",
    "satire", "comics", "graphic novels", "manga", "children",
    "middle grade", "picture books", "parenting", "family", "education",
    "teaching", "religion", "spirituality", "theology", "sports",
    "hobbies", "crafts", "gardening", "pets", "animals", "nature",
    "cyberpunk", "steampunk", "urban fantasy", "dark fantasy", "epic fantasy",
    "space opera", "hard sci-fi", "time travel", "military sci-fi", "post-apocalyptic",
    "zombies", "vampires", "werewolves", "paranormal", "supernatural", "magic",
    "witchcraft", "occult", "tarot", "astrology", "meditation", "yoga",
    "buddhism", "christianity", "islam", "judaism", "hinduism", "mythical",
    "folklore", "fairy tales", "legends", "fables", "short stories", "anthologies",
    "essays", "literary criticism", "linguistics", "journalism", "writing",
    "publishing", "books about books", "typography", "calligraphy", "origami",
    "knitting", "sewing", "woodworking", "carpentry", "plumbing", "electrical",
    "automotive", "motorcycles", "bicycles", "sailing", "aviation", "spaceflight"
]


def fetch_books(subject: str, start_index: int = 0, max_results: int = 40):
    

    params = {
        "q": subject,  # Search entire book metadata instead of just the strict subject category
        "startIndex": start_index,
        "maxResults": max_results,
        "printType": "books",
        "langRestrict": "en",
        "key":BOOKS_API_KEY
    }

    response = requests.get(
        BASE_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    return data.get("items", [])


def parse_books(raw_books):
    

    books = []

    for book in raw_books:

        info = book.get("volumeInfo", {})
        image_links = info.get("imageLinks", {})

        title = info.get("title")
        description = info.get("description")
        cover = image_links.get("thumbnail")

        # Skip incomplete books
        if not title:
            continue

        if not description:
            continue

        if not cover:
            continue

        # Convert HTTP -> HTTPS
        cover = cover.replace("http://", "https://")

        books.append(
            {
                "book_id": book["id"],
                "book_title": title,
                "book_overview": description,
                "book_cover_path": cover,
                "authors": info.get("authors", []),
                "categories": info.get("categories", [])
            }
        )

    return books


def search_book_by_title(query: str):
    """Search Google Books for a book by title. Returns parsed book dict or None."""
    params = {
        "q": f"intitle:{query}",
        "maxResults": 5,
        "printType": "books",
        "langRestrict": "en",
        "key": BOOKS_API_KEY
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        items = response.json().get("items", [])
    except requests.exceptions.RequestException:
        return None

    for book in items:
        info = book.get("volumeInfo", {})
        image_links = info.get("imageLinks", {})
        title = info.get("title")
        description = info.get("description")
        cover = image_links.get("thumbnail")

        if not title or not description or not cover:
            continue

        cover = cover.replace("http://", "https://")
        return {
            "book_id": book["id"],
            "book_title": title,
            "book_overview": description,
            "book_cover_path": cover,
            "authors": info.get("authors", []),
            "categories": info.get("categories", [])
        }
    return None
