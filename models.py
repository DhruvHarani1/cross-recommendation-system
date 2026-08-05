from sqlalchemy import String, ForeignKey, Float, ARRAY, DateTime
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from datetime import datetime, timezone


from database import Base


# ── User & Interactions (Google Auth future-ready) ────────────────────────────

class User(Base):
    __tablename__ = "users"


    user_id: Mapped[str] = mapped_column(String, primary_key=True)

    username: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String,
        nullable=True
    )

    display_name: Mapped[str] = mapped_column(
        String,
        nullable=True
    )

    profile_picture: Mapped[str] = mapped_column(
        String,
        nullable=True
    )

    provider: Mapped[str] = mapped_column(
        String,
        default="local"
    )

    is_active: Mapped[bool] = mapped_column(
        default=True
    )

    is_onboarded: Mapped[bool] = mapped_column(
        default=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )


class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    content_id: Mapped[str] = mapped_column(String)
    content_type: Mapped[str] = mapped_column(String)  # movie, song, game, book
    interaction_type: Mapped[str] = mapped_column(String)  # onboard_anchor, like, superlike, dislike
    weight: Mapped[float] = mapped_column(Float, default=1.0)  # +1.0 like, +2.0 superlike, -1.5 dislike
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

class UserLibrary(Base):
    __tablename__ = "user_library"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    content_id: Mapped[str] = mapped_column(String)
    content_type: Mapped[str] = mapped_column(String)  # movie, song, game, book
    added_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

# ── Content Tables ────────────────────────────────────────────────────────────

class Movie(Base):
    __tablename__ = "movie"

    movie_id: Mapped[str] = mapped_column(String,primary_key=True)
    movie_title: Mapped[str] = mapped_column(String)
    movie_overview:Mapped[str] = mapped_column(String)
    movie_poster_path:Mapped[str] = mapped_column(String)
    
    
class MovieKeyword(Base):
    __tablename__ = "movie_keywords"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    movie_id:Mapped[str] = mapped_column(ForeignKey("movie.movie_id"))
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

    game_id: Mapped[str] = mapped_column(String,primary_key=True)  # RAWG ID
    game_title: Mapped[str] = mapped_column(String)
    game_cover_path: Mapped[str] = mapped_column(String)
    game_genres: Mapped[str] = mapped_column(String)


class GameKeyword(Base):
    __tablename__ = "game_keywords"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    game_id: Mapped[str] = mapped_column(ForeignKey("game.game_id"))
    keyword: Mapped[str] = mapped_column(String)

class ContentEmbedding(Base):
    __tablename__ = "content_embedding"
    content_id: Mapped[str] = mapped_column(String, primary_key=True)
    content_type: Mapped[str] = mapped_column(String, primary_key=True)
    # Store embedding as a list of floats in PostgreSQL
    embedding: Mapped[list[float]] = mapped_column(ARRAY(Float), nullable=False)
    popularity_score: Mapped[float] = mapped_column(Float, default=0.0)
