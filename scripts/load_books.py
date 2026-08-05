import time
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models import Book, BookKeyword
from services.book_service import fetch_books, parse_books, BOOK_SUBJECTS
from services.recommendation_service import get_or_create_embedding

def load_books():
    db = SessionLocal()
    target_count = 10000
    inserted = 0
    
    print(f"Starting Book Fetcher. Target: {target_count} books.")
    
    try:
        for subject in BOOK_SUBJECTS:
            if inserted >= target_count:
                break
                
            print(f"\\n--- Fetching Genre: {subject} ---")
            start_index = 0
            # Google Books API pagination limit is 1000 for standard queries
            while start_index < 1000 and inserted < target_count:
                raw_books = None
                for attempt in range(3):
                    try:
                        raw_books = fetch_books(subject, start_index=start_index, max_results=40)
                        break
                    except Exception as e:
                        print(f"Attempt {attempt + 1}/3 failed: {e}")
                        if "429" in str(e):
                            print("Rate limited (429)! Sleeping for 60 seconds to reset per-minute quota...")
                            time.sleep(60)
                        else:
                            time.sleep(5)
                
                if not raw_books:
                    break # Probably end of results for this subject
                    
                books = parse_books(raw_books)
                
                for b_data in books:
                    if inserted >= target_count:
                        break
                        
                    book_id = b_data["book_id"]
                    
                    if db.query(Book).filter(Book.book_id == book_id).first():
                        continue
                    
                    # Keywords: authors + categories
                    keywords = []
                    keywords.extend([a.lower() for a in b_data.get("authors", [])])
                    keywords.extend([c.lower() for c in b_data.get("categories", [])])
                    
                    if not keywords:
                        continue
                    
                    # Insert Book
                    new_book = Book(
                        book_id=book_id,
                        book_title=b_data["book_title"],
                        book_overview=b_data["book_overview"],
                        book_cover_path=b_data["book_cover_path"],
                        book_categories=", ".join(b_data.get("categories", []))
                    )
                    db.add(new_book)
                    
                    # Insert Keywords (unique)
                    unique_kws = list(set(keywords))
                    for kw in unique_kws[:10]:
                        db.add(BookKeyword(book_id=book_id, keyword=kw))
                        
                    db.commit()
                    
                    # Embed
                    try:
                        get_or_create_embedding(db, book_id, "book")
                        db.commit()
                        inserted += 1
                        if inserted % 100 == 0:
                            print(f"[{inserted}/{target_count}] Successfully inserted book '{new_book.book_title}'")
                    except Exception as e:
                        print(f"Failed to embed {book_id}: {e}")
                        db.rollback()
                        
                start_index += 40
                time.sleep(0.5)
                
        print(f"\\nTotal books successfully inserted: {inserted}")
    finally:
        db.close()

if __name__ == "__main__":
    load_books()