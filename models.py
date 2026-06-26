from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from database import Base

class Movie(Base):
    __tablename__ = "movie"

    movie_id: Mapped[int] = mapped_column(primary_key=True)

    movie_title: Mapped[str]
    
class Keyword(Base):
    __tablename__ = "keywords"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str]=mapped_column(unique=True)