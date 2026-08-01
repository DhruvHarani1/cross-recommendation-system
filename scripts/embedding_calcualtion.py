import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sentence_transformers import SentenceTransformer
from sqlalchemy import cast, String
from database import SessionLocal
from models import (
    Movie, MovieKeyword,
    Book, BookKeyword,
    Song, SongKeyword,
    Game, GameKeyword,
    ContentEmbedding
)

model = SentenceTransformer("all-MiniLM-L6-v2")
def generate_embeddings_for_type(content_type: str):
    print(f"\n--- Processing embeddings for {content_type.upper()} ---")
    db = SessionLocal()
    
    # 1. Map content types to their corresponding SQLAlchemy Models
    models_mapping = {
        "movie": {"main": Movie, "keyword": MovieKeyword, "id_attr": "movie_id", "title_attr": "movie_title"},
        "book": {"main": Book, "keyword": BookKeyword, "id_attr": "book_id", "title_attr": "book_title"},
        "song": {"main": Song, "keyword": SongKeyword, "id_attr": "song_id", "title_attr": "song_title"},
        "game": {"main": Game, "keyword": GameKeyword, "id_attr": "game_id", "title_attr": "game_title"}
    }
    
    config = models_mapping.get(content_type)
    if not config:
        print(f"Error: Invalid content type '{content_type}'")
        return
        
    MainModel = config["main"]
    KeywordModel = config["keyword"]
    id_attr_name = config["id_attr"]
    title_attr_name = config["title_attr"]
    
    try:
        # 2. Get all items of this type missing from the content_embedding table
        unprocessed_items = db.query(MainModel).filter(
            ~db.query(ContentEmbedding).filter(
                ContentEmbedding.content_type == content_type,
                ContentEmbedding.content_id == cast(getattr(MainModel, id_attr_name), String)
            ).exists()
        ).all()
        
        print(f"Found {len(unprocessed_items)} unprocessed {content_type}(s).")
        if not unprocessed_items:
            return

        # 3. Process each item and construct their search descriptions
        for idx, item in enumerate(unprocessed_items):
            item_id = str(getattr(item, id_attr_name))
            title = getattr(item, title_attr_name)
            
            # Fetch all keywords associated with this item
            keywords_objs = db.query(KeywordModel).filter(
                getattr(KeywordModel, id_attr_name) == item_id
            ).all()
            keywords_str = ", ".join([k.keyword for k in keywords_objs])
            
            # Construct type-specific text context
            if content_type == "movie":
                input_text = f"Title: {title}. Overview: {item.movie_overview}. Keywords: {keywords_str}"
            elif content_type == "book":
                input_text = f"Title: {title}. Overview: {item.book_overview}. Category: {item.book_categories}. Keywords: {keywords_str}"
            elif content_type == "song":
                input_text = f"Title: {title}. Artist: {item.song_artist}. Keywords: {keywords_str}"
            elif content_type == "game":
                input_text = f"Title: {title}. Genres: {item.game_genres}. Keywords: {keywords_str}"
            
            vector = model.encode(input_text).tolist()
            
            # 5. Save record 
            entry = ContentEmbedding(
                content_id=item_id,
                content_type=content_type,
                embedding=vector,
                popularity_score=50.0  
            )
            db.add(entry)

            if idx % 10 == 0 and idx > 0:
                db.commit()
                print(f"Processed {idx}/{len(unprocessed_items)} {content_type}s...")
                
        db.commit()
        print(f"Embedding backfill complete for all {content_type}s!")
        
    except Exception as e:
        db.rollback()
        print(f"ERROR processing {content_type}: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    
    generate_embeddings_for_type("movie")
    generate_embeddings_for_type("game")
    generate_embeddings_for_type("song")
    generate_embeddings_for_type("book")