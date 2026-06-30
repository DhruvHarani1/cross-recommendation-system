import requests
import os
from dotenv import load_dotenv

load_dotenv()

BOOKS_API_KEY = os.getenv('GOOGLE_BOOKS_API_KEY')
BASE_URL = "https://www.googleapis.com/books/v1/volumes"

BOOK_SUBJECTS = [
    "fantasy",
    "science fiction",
    "romance",
    "mystery",
    "thriller",
    "horror",
    "adventure",
    "historical fiction",
    "young adult",
    "crime",
    "drama",
    "dystopian",
    "mythology"
]


def fetch_books(subject: str, start_index: int = 0, max_results: int = 40):
    

    params = {
        "q": f"subject:{subject}",
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
            }
        )

    return books
