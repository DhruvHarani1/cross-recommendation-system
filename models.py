from sqlalchemy import String,ForeignKey ,Float, ARRAY
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column,relationship


from database import Base

class Movie(Base):
    __tablename__ = "movie"

    movie_id: Mapped[int] = mapped_column(primary_key=True)
    movie_title: Mapped[str] = mapped_column(String)
    movie_overview:Mapped[str] = mapped_column(String)
    movie_poster_path:Mapped[str] = mapped_column(String)
    
    
class MovieKeyword(Base):
    __tablename__ = "movie_keywords"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    movie_id:Mapped[int] = mapped_column(ForeignKey("movie.movie_id"))
    keyword: Mapped[str]=mapped_column(String)
    

class ContentEmbedding(Base):
    __tablename__ = "content_embedding"
    content_id: Mapped[str] = mapped_column(String, primary_key=True)
    content_type: Mapped[str] = mapped_column(String, primary_key=True)
    # Store embedding as a list of floats in PostgreSQL
    embedding: Mapped[list[float]] = mapped_column(ARRAY(Float), nullable=False)
    popularity_score: Mapped[float] = mapped_column(Float, default=0.0)