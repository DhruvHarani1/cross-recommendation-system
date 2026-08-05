import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import Movie, Game, Book, MovieKeyword, GameKeyword, BookKeyword, ContentEmbedding, UserInteraction

def wipe_data():
    db = SessionLocal()
    try:
        print("Deleting Interactions...")
        db.query(UserInteraction).filter(UserInteraction.content_type.in_(['movie', 'game', 'book'])).delete(synchronize_session=False)
        print("Deleting Embeddings...")
        db.query(ContentEmbedding).filter(ContentEmbedding.content_type.in_(['movie', 'game', 'book'])).delete(synchronize_session=False)
        
        print("Deleting Keywords...")
        db.query(MovieKeyword).delete(synchronize_session=False)
        db.query(GameKeyword).delete(synchronize_session=False)
        db.query(BookKeyword).delete(synchronize_session=False)
        
        print("Deleting Movies, Games, Books...")
        db.query(Movie).delete(synchronize_session=False)
        db.query(Game).delete(synchronize_session=False)
        db.query(Book).delete(synchronize_session=False)
        
        db.commit()
        print("All old Movie, Game, and Book data successfully wiped!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    wipe_data()
