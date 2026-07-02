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
    
class Book(Base):
    __tablename__ = "book"
    
    book_id:Mapped[str] = mapped_column(String,primary_key=True)
    book_title:Mapped[str] = mapped_column(String)
    book_overview:Mapped[str] = mapped_column(String)
    book_cover_path:Mapped[str] = mapped_column(String)
    book_categories:Mapped[str] = mapped_column(String)
    
class BookKeyword(Base):
    __tablename__ = "book_keywords"
    
    id:Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    book_id:Mapped[str] = mapped_column(ForeignKey("book.book_id"))
    keyword:Mapped[str] = mapped_column(String)

class Song(Base):
    __tablename__ = "song"

    song_id: Mapped[str] = mapped_column(String, primary_key=True)  # use "artist::track" as a stable id, Last.fm has no numeric id
    song_title: Mapped[str] = mapped_column(String)
    song_artist: Mapped[str] = mapped_column(String)
    song_cover_path: Mapped[str] = mapped_column(String)


class SongKeyword(Base):
    __tablename__ = "song_keywords"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("song.song_id"))
    keyword: Mapped[str] = mapped_column(String)
    
class Game(Base):
    __tablename__ = "game"

    game_id: Mapped[int] = mapped_column(primary_key=True)  # RAWG ID
    game_title: Mapped[str] = mapped_column(String)
    game_cover_path: Mapped[str] = mapped_column(String)
    game_genres: Mapped[str] = mapped_column(String)


class GameKeyword(Base):
    __tablename__ = "game_keywords"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("game.game_id"))
    keyword: Mapped[str] = mapped_column(String)