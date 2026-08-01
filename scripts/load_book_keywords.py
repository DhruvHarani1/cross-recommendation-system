from database import SessionLocal

from services.book_db_service import get_all_books
from services.keyword_extractor import extract_keywords
from services.book_keyword_service import save_book_keywords


def load_book_keywords():

    db = SessionLocal()

    total_keywords = 0

    try:

        books = get_all_books(db)

        print(f"Found {len(books)} books.\n")

        for book in books:

            keywords = extract_keywords(
                title=book.book_title,
                overview=book.book_overview,
                categories=book.book_categories
            )

            inserted = save_book_keywords(
                db=db,
                book_id=book.book_id,
                keywords=keywords
            )

            total_keywords += inserted

            print(
                f"{book.book_title} -> {inserted} keywords"
            )

        print(f"\nTotal keywords inserted: {total_keywords}")

    finally:
        db.close()


if __name__ == "__main__":
    load_book_keywords()