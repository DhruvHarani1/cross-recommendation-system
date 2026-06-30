from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from models import Book


def save_books(db: Session, books):
    inserted_books = 0

    for book in books:

        existing_book = db.get(Book, book["book_id"])

        if existing_book:
            continue

        new_book = Book(
            book_id=book["book_id"],
            book_title=book["book_title"],
            book_overview=book["book_overview"],
            book_cover_path=book["book_cover_path"]
        )

        db.add(new_book)
        inserted_books += 1

    try:
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise

    return inserted_books


def get_all_books(db: Session):
    return db.query(Book).all()