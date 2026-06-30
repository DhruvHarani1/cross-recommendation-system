from database import SessionLocal

from services.book_service import (
    fetch_books,
    parse_books,
    BOOK_SUBJECTS
)

from services.book_db_service import save_books


def load_books(total_books: int = 200):

    db = SessionLocal()

    total_inserted = 0

    try:

        for subject in BOOK_SUBJECTS:

            print(f"\nFetching books from subject: {subject}")

            for start_index in range(0, total_books, 40):

                raw_books = fetch_books(
                    subject=subject,
                    start_index=start_index
                )

                books = parse_books(raw_books)

                inserted = save_books(db, books)

                total_inserted += inserted

                print(
                    f"Start Index: {start_index} | Inserted: {inserted}"
                )

        print(f"\nTotal books inserted: {total_inserted}")

    finally:
        db.close()


if __name__ == "__main__":
    load_books()