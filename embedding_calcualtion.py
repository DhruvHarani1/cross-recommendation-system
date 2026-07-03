from sentence_transformers import SentenceTransformer
from database import SessionLocal
from models import Movie,ContentEmbedding


def generate_embedding():
    model =  SentenceTransformer("all-MiniLM-L6-v2")
    
    db = SessionLocal()
    try:
        unprocessed_movie = db.query(Movie).filter(~db.query(ContentEmbedding).filter(ContentEmbedding.content_type=="movie",
                            ContentEmbedding.content_id==Movie.movie_id).exists()).all()
        print(f"Found unprocessed_movie f{len(unprocessed_movie)}")
        
        for idx ,movie in enumerate(unprocessed_movie):
            input_text = f"Title: {movie.movie_title}. Overview: {movie.movie_overview}"
        
            # vector type : List
            vector = model.encode(input_text).tolist()
            
            entry_row = ContentEmbedding(
                content_id=str(movie.movie_id),
                content_type='movie',
                embedding=vector,
                popularity_score=50.0 # Default popularity rating
            )

            db.add(entry_row)
            
            # commit in 10 baches 
            if idx %10==0 and idx >0:
                db.commit()
                print(f"PROCESSING MOVIES {idx/len(unprocessed_movie)}")
        db.commit()
    except Exception as e :
        db.rollback()
        print(f"ERROR Occured {e}")
    finally:
        db.close()
