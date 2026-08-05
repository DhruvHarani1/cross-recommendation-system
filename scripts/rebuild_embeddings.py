import os
import sys
import numpy as np
import math
from collections import Counter

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import ContentEmbedding, Movie, Game, Book, Song
from services.recommendation_service import get_keywords_str, get_model

def get_base_text(db, content_id, content_type, keyword_str):
    if content_type == "movie":
        item = db.get(Movie, content_id)
        if not item: return ""
        return f"Title: {item.movie_title}. Overview: {item.movie_overview}."
    elif content_type == "game":
        item = db.get(Game, content_id)
        if not item: return ""
        return f"Title: {item.game_title}. Genres: {item.game_genres}."
    elif content_type == "song":
        item = db.get(Song, content_id)
        if not item: return ""
        return f"Title: {item.song_title}. Artist: {item.song_artist}."
    elif content_type == "book":
        item = db.get(Book, content_id)
        if not item: return ""
        return f"Title: {item.book_title}. Overview: {item.book_overview}. Category: {item.book_categories}."
    return ""

def rebuild():
    db = SessionLocal()
    model = get_model()
    
    print("Fetching all items to compute IDF...")
    items = []
    
    # We will compute frequency of keywords
    keyword_freq = Counter()
    total_items = 0
    
    # 1. Gather all embeddings we have
    embeddings = db.query(ContentEmbedding).all()
    for emb in embeddings:
        kws = get_keywords_str(db, emb.content_id, emb.content_type)
        if not kws: continue
        
        kw_list = [k.strip().lower() for k in kws.split(",") if len(k.strip()) >= 3]
        
        # for df, we only count unique per document
        for k in set(kw_list):
            keyword_freq[k] += 1
            
        total_items += 1
        items.append({
            "id": emb.content_id,
            "type": emb.content_type,
            "kws": kw_list,
            "emb_obj": emb
        })
        
    print(f"Total items: {total_items}")
    
    # 2. Re-embed with TF-IDF Hack
    print("Re-embedding with TF-IDF keyword repetition...")
    
    batch_size = 50
    for i in range(0, len(items), batch_size):
        batch = items[i:i+batch_size]
        
        texts = []
        for item in batch:
            base_text = get_base_text(db, item["id"], item["type"], "")
            
            # Weighted keywords
            weighted_kws = []
            for kw in item["kws"]:
                df = keyword_freq.get(kw, 1)
                # IDF formula: log(N/df)
                idf = math.log10(total_items / df) if df > 0 else 1.0
                
                # Repeat keyword based on idf (if idf is 3.5, repeat 4 times)
                repeats = max(1, min(6, int(round(idf))))
                weighted_kws.extend([kw] * repeats)
                
            final_text = f"{base_text} Keywords: {', '.join(weighted_kws)}"
            texts.append(final_text)
            
        # Batch encode
        print(f"Encoding batch {i//batch_size + 1} / {math.ceil(len(items)/batch_size)}...")
        new_embs = model.encode(texts)
        
        for j, item in enumerate(batch):
            item["emb_obj"].embedding = new_embs[j].tolist()
            
        db.commit()
        
    print("All embeddings successfully rebuilt with TF-IDF weighting!")
    db.close()

if __name__ == "__main__":
    rebuild()
