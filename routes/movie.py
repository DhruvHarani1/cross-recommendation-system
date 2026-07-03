from fastapi import APIRouter,Depends,HTTPException,Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer

from database import get_db
from models import Movie,ContentEmbedding
from schemas.movie import MovieCreate
import numpy as np

router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)

@router.post("/")
def create_movie(movie:MovieCreate,db:Session = Depends(get_db)):
    
    existing_movie = db.get(Movie,movie.movie_id)
    
    if existing_movie:
        raise HTTPException(
            status_code=409,
            detail="Movie already exists."
        )
    
    new_movie = Movie(
       movie_id = movie.movie_id,
       movie_title = movie.movie_title,
       movie_overview = movie.movie_overview,
       movie_poster_path = movie.movie_poster_path
    )
    
    try:
        db.add(new_movie)
        db.commit()
        db.refresh(new_movie)

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Database Error : {str(e)}"
        )
    
    return {
        "message": "Movie added successfully",
        "movie": new_movie
    }
    
model = SentenceTransformer("all-MiniLM-L6-v2")
def calculate_cosine_similarity(vec1:np.ndarray,vec2:np.ndarray) ->float:
    dot_product = np.dot(vec1,vec2)
    norm_vec1 = np.linalg.norm(vec1)
    norm_vec2 = np.linalg.norm(vec2)
    
    if norm_vec1 == 0 or norm_vec2 == 0:
        return 0.0
    return float(dot_product / (norm_vec1 * norm_vec2))
@router.get("/{movie_id}/recommend")
def get_cross_recommendation(movie_id: int,
    target_type: str = Query("all", regex="^(all|game|music|book)$", description="Filter recommendations"),
    db: Session = Depends(get_db)):
    movie = db.get(Movie,movie_id)
    if not movie:
        raise HTTPException(status_code=404,detail="Movie not found")
    
    #fist: try to find in content_embegging table
    
    embedding_record = db.query(ContentEmbedding).filter_by(content_type='movie',content_id=str(movie_id)).first()
    
    if not embedding_record:
        print(f"Embedding not found for movie: {movie.movie_title}. Generating dynamically")
        context_text = f"Title: {movie.movie_title}. Overview: {movie.movie_overview}"
        
        vector = model.encode(context_text).tolist()
        
        # 3. Create the ContentEmbedding object
        embedding_record = ContentEmbedding(
            content_id=str(movie_id),
            content_type='movie',
            embedding=vector,
            popularity_score=50.0 
        )
        
        db.add(embedding_record)
        db.commit()
        db.refresh(embedding_record)
    target_vector = np.array(embedding_record.embedding)

    # 2. Fetch the candidate embeddings from the database based on the target_type filter
    if target_type == "all":
        candidates = db.query(ContentEmbedding).filter(ContentEmbedding.content_type != 'movie').all()
    else:
        candidates = db.query(ContentEmbedding).filter_by(content_type=target_type).all()

    if not candidates:
        return {"movie_id": movie_id, "movie_title": movie.movie_title, "recommendations": []}
    
    scored_items = []
    for cand in candidates:
        cand_vector = np.array(cand.embedding)
        similarity = calculate_cosine_similarity(target_vector, cand_vector)
        
        # 80% similarity + 20% popularity 
        final_score = (0.8 * similarity) + (0.2 * (cand.popularity_score / 100.0))
        
        scored_items.append({
            "id": cand.content_id,
            "type": cand.content_type,
            "similarity": similarity,
            "final_score": final_score
        })

    # Sort items by final score descending and select the top 5
    scored_items.sort(key=lambda x: x["final_score"], reverse=True)
    top_candidates = scored_items[:5]

    recommendations = []
    for item in top_candidates:
        item_id = item["id"]
        item_type = item["type"]
        
        # Fetch the title of the item from its corresponding table
        title = f"{item_type.capitalize()} {item_id}"  
        if item_type == "game":
            game_title_query = text("SELECT game_title FROM games WHERE game_id = :game_id")
            title = db.execute(game_title_query, {"game_id": int(item_id)}).scalar() or title
        elif item_type == "music":
            music_title_query = text("SELECT music_title FROM music WHERE music_id = :music_id")
            title = db.execute(music_title_query, {"music_id": item_id}).scalar() or title

        # Create a simple explanation
        explanation = f"Matched because of similar {item_type} themes"

        recommendations.append({
            "id": item_id,
            "type": item_type,
            "title": title,
            "match_score": round(item["similarity"] * 100, 1),
            "explanation": explanation
        })
        
    return {
        "movie_id": movie_id,
        "movie_title": movie.movie_title,
        "recommendations": recommendations
    }

    