from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from models import BookKeyword


def save_book_keywords(db: Session, book_id: str, keywords: list):

    inserted = 0

    for keyword in keywords:

        existing = (
            db.query(BookKeyword)
            .filter(
                BookKeyword.book_id == book_id,
                BookKeyword.keyword == keyword
            )
            .first()
        )

        if existing:
            continue

        db.add(
            BookKeyword(
                book_id=book_id,
                keyword=keyword
            )
        )

        inserted += 1

    try:
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise

    return inserted