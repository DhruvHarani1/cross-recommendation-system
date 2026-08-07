from sqlalchemy.orm import Session

from models import Movie, Game, Book, Song, MovieKeyword, GameKeyword, BookKeyword, SongKeyword
from services.tmdb_service import search_movie_by_title, fetch_movie_keywords, parse_keywords as parse_movie_keywords
from services.igdb_service import search_game_by_title
from services.book_service import search_book_by_title
from services.spotify_service import search_song_by_title, fetch_song_tags, fetch_artist_tags, parse_keywords as parse_song_keywords
from services.keyword_extractor import extract_keywords


# --------------------------------------------------------------------------- #
#  Internal DB helpers                                                          #
# --------------------------------------------------------------------------- #

def _save_movie(db: Session, movie: dict):
    """Insert a single movie dict into the DB if it doesn't already exist."""
    existing = db.get(Movie, movie["movie_id"])
    if existing:
        return
    db.add(Movie(
        movie_id=movie["movie_id"],
        movie_title=movie["movie_title"],
        movie_overview=movie["movie_overview"],
        movie_poster_path=movie["movie_poster_path"]
    ))
    db.commit()


def _save_movie_keywords(db: Session, movie_id: str, keywords: list):
    for kw in keywords:
        existing = (
            db.query(MovieKeyword)
            .filter(MovieKeyword.movie_id == movie_id, MovieKeyword.keyword == kw)
            .first()
        )
        if not existing:
            db.add(MovieKeyword(movie_id=movie_id, keyword=kw))
    db.commit()


def _save_game(db: Session, game: dict):
    existing = db.get(Game, game["game_id"])
    if existing:
        return
    db.add(Game(
        game_id=game["game_id"],
        game_title=game["game_title"],
        game_cover_path=game["game_cover_path"],
        game_genres=game["game_genres"]
    ))
    db.commit()


def _save_game_keywords(db: Session, game_id: str, keywords: list):
    for kw in keywords:
        existing = (
            db.query(GameKeyword)
            .filter(GameKeyword.game_id == game_id, GameKeyword.keyword == kw)
            .first()
        )
        if not existing:
            db.add(GameKeyword(game_id=game_id, keyword=kw))
    db.commit()


def _save_book(db: Session, book: dict):
    existing = db.get(Book, book["book_id"])
    if existing:
        return
    db.add(Book(
        book_id=book["book_id"],
        book_title=book["book_title"],
        book_overview=book["book_overview"],
        book_cover_path=book["book_cover_path"],
        book_categories=", ".join(book.get("categories", []))
    ))
    db.commit()


def _save_book_keywords(db: Session, book_id: str, keywords: list):
    for kw in keywords:
        existing = (
            db.query(BookKeyword)
            .filter(BookKeyword.book_id == book_id, BookKeyword.keyword == kw)
            .first()
        )
        if not existing:
            db.add(BookKeyword(book_id=book_id, keyword=kw))
    db.commit()


def _save_song(db: Session, song: dict):
    existing = db.get(Song, song["song_id"])
    if existing:
        return
    db.add(Song(
        song_id=song["song_id"],
        song_title=song["song_title"],
        song_artist=song["song_artist"],
        song_cover_path=song["song_cover_path"]
    ))
    db.commit()


def _save_song_keywords(db: Session, song_id: str, keywords: list):
    for kw in keywords:
        existing = (
            db.query(SongKeyword)
            .filter(SongKeyword.song_id == song_id, SongKeyword.keyword == kw)
            .first()
        )
        if not existing:
            db.add(SongKeyword(song_id=song_id, keyword=kw))
    db.commit()


# --------------------------------------------------------------------------- #
#  Per-type fallback functions                                                  #
# --------------------------------------------------------------------------- #

def _fallback_movie(db: Session, query: str):
    """Search TMDB, insert into DB with keywords, return (movie_id, 'movie') or None."""
    movie = search_movie_by_title(query)
    if not movie:
        return None

    _save_movie(db, movie)

    try:
        raw_kw = fetch_movie_keywords(movie["movie_id"])
        keywords = parse_movie_keywords(raw_kw)
    except Exception:
        keywords = []

    if keywords:
        _save_movie_keywords(db, movie["movie_id"], keywords)

    return (movie["movie_id"], "movie")


def _fallback_game(db: Session, query: str):
    """Search IGDB, insert into DB with tags as keywords, return (game_id, 'game') or None."""
    game = search_game_by_title(query)
    if not game:
        return None

    _save_game(db, game)

    keywords = game.get("game_keywords", [])

    if keywords:
        _save_game_keywords(db, game["game_id"], keywords)

    return (game["game_id"], "game")


def _fallback_book(db: Session, query: str):
    """Search Google Books, insert into DB with NLP-extracted keywords, return (book_id, 'book') or None."""
    book = search_book_by_title(query)
    if not book:
        return None

    _save_book(db, book)

    try:
        categories_str = ", ".join(book.get("categories", []))
        keywords = extract_keywords(
            title=book["book_title"],
            overview=book["book_overview"],
            categories=categories_str
        )
    except Exception:
        keywords = []

    if keywords:
        _save_book_keywords(db, book["book_id"], keywords)

    return (book["book_id"], "book")


def _fallback_song(db: Session, query: str):
    """Search Last.fm, insert into DB with track/artist tags, return (song_id, 'song') or None."""
    song = search_song_by_title(query)
    if not song:
        return None

    _save_song(db, song)

    # Fetch Last.fm tags for track + artist
    keywords = []
    try:
        raw_track_tags = fetch_song_tags(song["song_artist"], song["song_title"])
        keywords.extend(parse_song_keywords(raw_track_tags))
    except Exception:
        pass

    try:
        raw_artist_tags = fetch_artist_tags(song["song_artist"])
        keywords.extend(parse_song_keywords(raw_artist_tags))
    except Exception:
        pass

    keywords = list(dict.fromkeys(keywords))  # deduplicate preserving order
    if keywords:
        _save_song_keywords(db, song["song_id"], keywords)

    return (song["song_id"], "song")


# --------------------------------------------------------------------------- #
#  Public entrypoint                                                            #
# --------------------------------------------------------------------------- #

FALLBACK_ORDER = ["movie", "song", "game", "book"]


def search_external_apis(db: Session, query: str, source_type: str = None):
    """Stage 3: Search external APIs for an item not found in the local DB.

    If source_type is provided, only that API is queried.
    Otherwise all APIs are tried in order: movie → song → game → book.

    Returns (item_id, item_type) on success, or None if nothing found.
    The found item is fully persisted to the DB (metadata + keywords)
    so that get_or_create_embedding() can generate the embedding next.
    """
    types_to_try = [source_type] if source_type else FALLBACK_ORDER

    for content_type in types_to_try:
        try:
            if content_type == "movie":
                result = _fallback_movie(db, query)
            elif content_type == "song":
                result = _fallback_song(db, query)
            elif content_type == "game":
                result = _fallback_game(db, query)
            elif content_type == "book":
                result = _fallback_book(db, query)
            else:
                continue

            if result:
                return result

        except Exception:
            continue

    return None
