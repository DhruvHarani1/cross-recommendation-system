from sqlalchemy import String,ForeignKey
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