<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge&logo=semver&logoColor=white" alt="Version"/>
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License"/>
<img src="https://img.shields.io/badge/FastAPI-0.138.0-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>

<br/><br/>

<h1>🎬 Cross Recommendation System</h1>

<p align="center">
  <em>Discover your next favourite movie, book, song, or game — <strong>across every entertainment domain</strong>,<br/>powered by semantic vector embeddings and AI-driven cosine similarity.</em>
</p>

<br/>

[![Star this repo](https://img.shields.io/github/stars/yourusername/cross-recommendation-system?style=social)](https://github.com/yourusername/cross-recommendation-system)
&nbsp;
[![Fork this repo](https://img.shields.io/github/forks/yourusername/cross-recommendation-system?style=social)](https://github.com/yourusername/cross-recommendation-system/fork)

</div>

---

## 📖 Table of Contents

- [✨ What is Cross Recommendation?](#-what-is-cross-recommendation)
- [🚀 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🧠 Recommendation Engine](#-recommendation-engine)
- [⚙️ Recommendation Pipeline](#️-recommendation-pipeline)
- [📁 Project Structure](#-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔌 API Reference](#-api-reference)
- [🗄️ Database Design](#️-database-design)
- [🚦 Getting Started](#-getting-started)
- [🌍 Environment Variables](#-environment-variables)
- [📸 Screenshots](#-screenshots)
- [📈 Performance](#-performance)
- [🔮 Future Improvements](#-future-improvements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👤 Author](#-author)

---

## ✨ What is Cross Recommendation?

Most recommendation systems are **domain-locked** — Netflix recommends movies, Spotify recommends songs. **Cross Recommendation System** breaks those walls.

Loved the movie *Interstellar*? Get recommended:
- 📚 Books with similar philosophical themes
- 🎮 Games with space-exploration vibes
- 🎵 Songs that match the emotional tone

The engine does **not** rely on naive keyword matching. Instead, it converts content from all domains into **dense semantic vector embeddings** using the `all-MiniLM-L6-v2` Sentence Transformer model, stores them in PostgreSQL, and runs vectorized **cosine similarity** search at recommendation time — giving truly meaningful, cross-domain suggestions.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Google OAuth** | One-click sign-in via Google |
| 🔑 **JWT Authentication** | Stateless, secure session management |
| 🎉 **Personalized Onboarding** | User picks favourite content to seed their taste profile |
| 👤 **User Profile** | View interaction history and taste breakdown |
| 🌉 **Cross-Domain Recommendations** | Movie → Books, Songs, Games and vice versa |
| 🔍 **Semantic Search** | 4-stage search pipeline: exact → fuzzy → API fallback → vector |
| 🧬 **Vector Embeddings** | `all-MiniLM-L6-v2` (384-dim) for all content types |
| 📐 **Cosine Similarity Engine** | Vectorized NumPy matrix dot-product for O(n) similarity search |
| 🗺️ **Explore Page** | Browse popular content with real-time search |
| 📚 **User Library** | Save and manage your personal content library |
| 📊 **Match Score** | Per-recommendation confidence score (0–100%) |
| 🎭 **Diversity Balancing** | Ensures balanced recommendations across all content types |
| 📱 **Responsive UI** | Fully mobile-responsive dark-theme interface |
| ⚡ **In-Memory Cache** | Embedding matrix pre-loaded into RAM for near-instant responses |
| 🌐 **Multi-API Fallback** | Falls back to TMDB, Last.fm, RAWG, and Google Books when content is missing |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│         (Vite + Tailwind CSS + Framer Motion)           │
│   Pages: Dashboard, Explore, Library, Onboarding        │
└──────────────────────┬──────────────────────────────────┘
                       │  HTTP (Axios)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                         │
│  Routers: auth, movie, recommendation,                   │
│           personalization, content_browse                │
│  Services: recommendation, personalization,              │
│            auth, tmdb, spotify, rawg, books              │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐   ┌─────────────────────────────┐
│   PostgreSQL DB       │   │    External APIs             │
│  - users              │   │  🎬 TMDB (Movies)           │
│  - movie / book /     │   │  📚 Google Books            │
│    song / game        │   │  🎵 Spotify / Last.fm /     │
│  - content_embedding  │   │      Deezer / iTunes        │
│  - user_interactions  │   │  🎮 RAWG / IGDB (Games)    │
│  - user_library       │   └─────────────────────────────┘
└──────────────┬───────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│           Sentence Transformer Model                      │
│      all-MiniLM-L6-v2 (384-dimensional vectors)          │
│      Pre-loaded into RAM on server startup               │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│          Recommendation Engine                            │
│   NumPy matrix · cosine similarity · popularity blend    │
│   Diversity balancing across content types               │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 Recommendation Engine

The recommendation engine is the core of this project. Here's a deep dive into how it works.

### Why Semantic Search > Keyword Matching

| Keyword Matching | Semantic Embeddings |
|---|---|
| Looks for shared words | Understands conceptual meaning |
| "Space" only matches items tagged "space" | "Space" matches loneliness, exploration, philosophy |
| Domain-blind | Genuinely cross-domain |
| Brittle to typos or phrasing | Robust to variations in language |
| Cannot handle abstract concepts | "I want something melancholic" works |

### Sentence Transformers (`all-MiniLM-L6-v2`)

This project uses the `all-MiniLM-L6-v2` model from Hugging Face — a lightweight but powerful Sentence Transformer that maps text into a **384-dimensional dense vector space**. Semantically similar content ends up geometrically close in this space.

### Embedding Generation

Each piece of content is encoded into a rich text representation before embedding:

```python
# Movie
input_text = f"Title: {title}. Overview: {overview}. Keywords: {keywords}"

# Book
input_text = f"Title: {title}. Overview: {overview}. Category: {categories}. Keywords: {keywords}"

# Song
input_text = f"Title: {title}. Artist: {artist}. Keywords: {keywords}"

# Game
input_text = f"Title: {title}. Genres: {genres}. Keywords: {keywords}"
```

Keywords are **double-weighted** (repeated twice) to amplify their semantic contribution to the final vector.

### Cosine Similarity — The Math

At recommendation time, the entire embedding matrix is pre-loaded into RAM. Given a source vector **q** and a matrix of all candidate vectors **M** (each row L2-normalized), similarity is computed as:

```
similarities = M @ q   (vectorized dot-product, O(n) via NumPy)
```

Since all vectors are L2-normalized, this dot product equals cosine similarity exactly.

### Scoring Formula

Each candidate receives a blended score:

```
final_score = (0.8 × cosine_similarity) + (0.2 × popularity_score)
```

This means highly semantically similar items are prioritized, but a small popularity boost prevents recommending completely obscure content when similarity scores are close.

### Diversity Balancing

When recommending across multiple content types, a **slot-balancing algorithm** ensures at least one item per available content type, then fills remaining slots with the globally highest-scoring items. This prevents the engine from returning 10 books when you asked for mixed recommendations.

### 4-Stage Search Pipeline

When you search by query text, the engine runs through 4 escalating stages:

```
Stage 1a │ Exact title / title+artist match in local DB
         ↓ (no match?)
Stage 1b │ Substring match in local DB
         ↓ (no match?)
Stage 2  │ Levenshtein fuzzy match (catches typos: "intersteller" → "Interstellar")
         ↓ (no match?)
Stage 3  │ External API fallback (TMDB / Last.fm / RAWG / Google Books)
         │ → Fetches, saves, and embeds the item on-the-fly
         ↓ (still no match?)
Stage 4  │ Pure semantic embedding search
         │ → Encodes query as a vector, finds nearest DB embedding
         │ → Handles abstract queries: "something melancholic", "survival horror vibes"
```

---

## ⚙️ Recommendation Pipeline

```
  User selects or searches for content
              │
              ▼
  Backend checks embedding cache (RAM)
  If missing → generate & store embedding
              │
              ▼
  L2-normalize source embedding vector
              │
              ▼
  Vectorized dot-product against full
  embedding matrix (NumPy, O(n))
              │
              ▼
  Apply blended score:
  0.8 × similarity + 0.2 × popularity
              │
              ▼
  Diversity balancing across content types
              │
              ▼
  Fetch metadata (title, cover image)
  for top-K candidates
              │
              ▼
  Return recommendations with match_score
              │
              ▼
  Frontend renders cards with confidence %
```

---

## 📁 Project Structure

```
cross-recommendation-system/
│
├── 📄 main.py                     # FastAPI app entry point, router registration
├── 📄 models.py                   # SQLAlchemy ORM models
├── 📄 database.py                 # DB engine & session configuration
├── 📄 requirements.txt            # Python dependencies
├── 📄 pyproject.toml
│
├── 📂 routes/                     # FastAPI route handlers
│   ├── auth.py                    # Signup, login, Google OAuth, /me
│   ├── recommendation.py          # Cross-domain recommendation endpoints
│   ├── personalization.py         # Taste profile & personalized feed
│   ├── content_browse.py          # Search & popular content for onboarding
│   └── movie.py                   # Movie-specific routes
│
├── 📂 services/                   # Business logic layer
│   ├── recommendation_service.py  # Core engine: embeddings, cosine similarity
│   ├── personalization_service.py # Taste vectors, interaction weights, clusters
│   ├── auth_service.py            # Password hashing, JWT creation
│   ├── api_fallback_service.py    # Multi-API fallback orchestrator
│   ├── tmdb_service.py            # TMDB movie search & fetch
│   ├── spotify_service.py         # Spotify song search
│   ├── lastfm_service.py          # Last.fm song search & metadata
│   ├── deezer_service.py          # Deezer fallback for songs
│   ├── itunes_service.py          # iTunes fallback for songs
│   ├── igdb_service.py            # IGDB game search
│   ├── book_service.py            # Google Books search
│   ├── game_service.py            # Game metadata resolution
│   ├── movie_service.py           # Movie metadata resolution
│   ├── song_service.py            # Song metadata resolution
│   ├── keyword_extractor.py       # NLP keyword extraction (spaCy)
│   ├── movie_keyword_service.py   # Movie keyword management
│   ├── book_keyword_service.py    # Book keyword management
│   ├── song_keyword_service.py    # Song keyword management
│   └── game_keyword_service.py    # Game keyword management
│
├── 📂 schemas/                    # Pydantic request/response models
│   ├── auth.py                    # UserSignup, UserLogin, LoginResponse
│   ├── recommendation.py          # RecommendationResponse schemas
│   └── movie.py                   # Movie schemas
│
├── 📂 scripts/                    # One-time data pipeline scripts
│   ├── embedding_calcualtion.py   # Batch-generate embeddings for all content
│   ├── rebuild_embeddings.py      # Rebuild/refresh embedding table
│   ├── recalculate_popularity.py  # Recalculate popularity scores
│   ├── load_movies.py             # Seed movies from TMDB
│   ├── load_books.py              # Seed books from Google Books
│   ├── load_games.py              # Seed games from RAWG
│   ├── hybrid_fetch_songs.py      # Seed songs from multiple APIs
│   ├── load_movie_keywords.py     # Load TMDB keywords for movies
│   ├── load_book_keywords.py      # Load keywords for books
│   ├── load_game_keywords.py      # Load keywords for games
│   ├── fix_posters.py             # Fix broken poster URLs
│   ├── wipe_other_media.py        # Database cleanup utility
│   └── create_tables.py           # Initialize database schema
│
├── 📂 dependencies/
│   └── auth.py                    # JWT dependency injection (get_current_user)
│
└── 📂 frontend/                   # React + Vite + TypeScript frontend
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    │
    └── 📂 src/
        ├── App.jsx                # Root component & route configuration
        ├── main.tsx               # React entry point
        ├── index.css              # Global styles
        │
        ├── 📂 pages/
        │   ├── Dashboard.jsx      # Main home dashboard
        │   ├── Explore.jsx        # Browse & search all content
        │   ├── Library.jsx        # User's saved content library
        │   ├── Onboarding.jsx     # First-time taste setup wizard
        │   ├── Login.jsx          # Login page
        │   └── Signup.jsx         # Registration page
        │
        ├── 📂 components/
        │   ├── Hero.jsx           # Landing page hero section
        │   ├── Navbar.jsx         # Top navigation bar
        │   ├── MainNavbar.jsx     # Authenticated navbar
        │   ├── Footer.jsx         # Site footer
        │   ├── HowItWorks.jsx     # Landing page explainer section
        │   ├── FeatureSection.jsx # Features showcase
        │   ├── TryItOut.jsx       # Interactive demo component
        │   ├── PosterWall.jsx     # Animated poster mosaic
        │   ├── ProtectedRoute.jsx # Auth guard for private routes
        │   ├── 📂 auth/           # Auth form components
        │   ├── 📂 dashboard/      # Dashboard sub-components
        │   ├── 📂 explore/        # Explore page components
        │   ├── 📂 features/       # Feature card components
        │   └── 📂 onboarding/     # Onboarding wizard components
        │
        ├── 📂 api/                # Axios API call functions
        ├── 📂 context/            # React context (auth state)
        ├── 📂 hooks/              # Custom React hooks
        └── 📂 data/               # Static data / constants
```

---

## 🛠️ Tech Stack

<details>
<summary><strong>🎨 Frontend</strong></summary>

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI component framework |
| TypeScript | ~6.0 | Type safety |
| Vite | 8.x | Dev server & build tool |
| Tailwind CSS | 4.x | Utility-first styling |
| Framer Motion | 12.x | Animations & transitions |
| GSAP | 3.x | Advanced scroll animations |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Lucide React | Latest | Icon library |
| React Icons | 5.x | Extended icon set |
| @react-oauth/google | 0.13 | Google OAuth integration |

</details>

<details>
<summary><strong>⚙️ Backend</strong></summary>

| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.138 | Async Python web framework |
| Uvicorn | 0.49 | ASGI server |
| SQLAlchemy | 2.0 | ORM & DB abstraction |
| PostgreSQL | 16+ | Relational database with ARRAY support |
| psycopg2 | 2.9 | PostgreSQL driver |
| Pydantic | 2.x | Request/response validation |
| Python-Jose | 3.5 | JWT encoding/decoding |
| Passlib + bcrypt | 1.7 / 4.0 | Password hashing |
| python-dotenv | 1.2 | Environment variable loading |
| httpx | 0.28 | Async HTTP client |

</details>

<details>
<summary><strong>🧬 ML / NLP</strong></summary>

| Technology | Version | Purpose |
|---|---|---|
| Sentence Transformers | 5.6 | `all-MiniLM-L6-v2` embedding model |
| Hugging Face Hub | 1.21 | Model downloading & management |
| PyTorch | 2.12 | Tensor computation backend |
| Transformers | 5.12 | Hugging Face model library |
| NumPy | 2.4 | Vectorized cosine similarity math |
| SciPy | 1.17 | Scientific computing utilities |
| scikit-learn | 1.9 | KMeans clustering (taste profiles) |
| spaCy | 3.8 | NLP keyword extraction |
| Levenshtein | 0.27 | Fuzzy string matching for search |
| RapidFuzz | 3.14 | Fast fuzzy matching utilities |

</details>

<details>
<summary><strong>🌐 External APIs</strong></summary>

| API | Domain | Usage |
|---|---|---|
| TMDB API | 🎬 Movies | Movie data, posters, keywords |
| Google Books API | 📚 Books | Book metadata, covers, descriptions |
| Spotify API | 🎵 Music | Song search and metadata |
| Last.fm API | 🎵 Music | Song tags, artist info |
| Deezer API | 🎵 Music | Fallback song source |
| iTunes API | 🎵 Music | Secondary song fallback |
| RAWG API | 🎮 Games | Game metadata, genres, covers |
| IGDB API | 🎮 Games | Alternative game data source |

</details>

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/signup` | Register a new account | ❌ |
| `POST` | `/auth/login` | Email/password login → JWT | ❌ |
| `POST` | `/auth/google` | Google OAuth login → JWT | ❌ |
| `GET` | `/auth/me` | Get current user profile | ✅ JWT |
| `GET` | `/auth/check-username/{username}` | Check username availability | ❌ |
| `GET` | `/auth/check-email/{email}` | Check email availability | ❌ |

### Recommendations

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/recommendations/` | Get recommendations by content ID & type | ❌ |
| `GET` | `/recommendations/search` | Free-text semantic search + recommendations | ❌ |

**Query Parameters for `/recommendations/`:**

| Parameter | Type | Description | Example |
|---|---|---|---|
| `source_id` | `string` | ID of the source content item | `tt0816692` |
| `source_type` | `string` | Type: `movie`, `song`, `game`, `book` | `movie` |
| `target_types` | `string[]` | Filter output types (default: `all`) | `game&target_types=book` |
| `limit` | `int` | Number of results (1–20, default 5) | `10` |

**Query Parameters for `/recommendations/search`:**

| Parameter | Type | Description | Example |
|---|---|---|---|
| `q` | `string` | Free text query (min 2 chars) | `Interstellar` |
| `source_type` | `string` | Optional: narrow search to type | `movie` |
| `target_types` | `string[]` | Filter output types | `game` |
| `limit` | `int` | Number of results (1–20) | `8` |

### Content Browse

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/content/search` | Search content by title across all domains | ❌ |
| `GET` | `/content/popular` | Get top-rated content by popularity score | ❌ |
| `GET` | `/movies/` | List movies | ❌ |

### Personalization

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/personalization/onboard` | Submit onboarding preferences | ✅ JWT |
| `GET` | `/personalization/feed` | Get personalized content feed | ✅ JWT |
| `POST` | `/personalization/interact` | Record like / dislike / superlike | ✅ JWT |
| `GET` | `/personalization/profile` | Get user taste profile | ✅ JWT |
| `GET` | `/personalization/library` | Get user content library | ✅ JWT |
| `POST` | `/personalization/library` | Add item to library | ✅ JWT |
| `DELETE` | `/personalization/library/{id}` | Remove item from library | ✅ JWT |

---

## 🗄️ Database Design

The database is a PostgreSQL instance managed via SQLAlchemy 2.0 with mapped columns. The schema is auto-created on server startup via `Base.metadata.create_all()`.

```
┌───────────────────┐       ┌──────────────────────────┐
│      users        │       │    user_interactions      │
├───────────────────┤       ├──────────────────────────┤
│ user_id  (PK)     │──┐    │ id           (PK, auto)  │
│ username  UNIQUE  │  │    │ user_id      (FK→users)  │
│ email     UNIQUE  │  └───▶│ content_id   STRING      │
│ password_hash     │       │ content_type STRING      │
│ display_name      │       │ interaction_type STRING  │
│ profile_picture   │       │   (onboard_anchor/like/  │
│ provider          │       │    superlike/dislike)    │
│ is_active  BOOL   │       │ weight       FLOAT       │
│ is_onboarded BOOL │       │ created_at   DATETIME    │
│ created_at  DT    │       └──────────────────────────┘
└───────────────────┘
         │                  ┌──────────────────────────┐
         │                  │      user_library        │
         │                  ├──────────────────────────┤
         └─────────────────▶│ id          (PK, auto)  │
                            │ user_id     (FK→users)  │
                            │ content_id  STRING      │
                            │ content_type STRING     │
                            │ added_at    DATETIME    │
                            └──────────────────────────┘

┌───────────────────┐   ┌────────────────────┐
│      movie        │   │   movie_keywords   │
├───────────────────┤   ├────────────────────┤
│ movie_id  (PK)    │──▶│ id  (PK, auto)    │
│ movie_title       │   │ movie_id (FK)     │
│ movie_overview    │   │ keyword  STRING   │
│ movie_poster_path │   └────────────────────┘
└───────────────────┘

┌───────────────────┐   ┌────────────────────┐
│      book         │   │   book_keywords    │
├───────────────────┤   ├────────────────────┤
│ book_id   (PK)    │──▶│ id  (PK, auto)    │
│ book_title        │   │ book_id  (FK)     │
│ book_overview     │   │ keyword  STRING   │
│ book_cover_path   │   └────────────────────┘
│ book_categories   │
└───────────────────┘

┌───────────────────┐   ┌────────────────────┐
│      song         │   │   song_keywords    │
├───────────────────┤   ├────────────────────┤
│ song_id   (PK)    │──▶│ id  (PK, auto)    │
│ song_title        │   │ song_id  (FK)     │
│ song_artist       │   │ keyword  STRING   │
│ song_cover_path   │   └────────────────────┘
└───────────────────┘

┌───────────────────┐   ┌────────────────────┐
│      game         │   │   game_keywords    │
├───────────────────┤   ├────────────────────┤
│ game_id   (PK)    │──▶│ id  (PK, auto)    │
│ game_title        │   │ game_id  (FK)     │
│ game_cover_path   │   │ keyword  STRING   │
│ game_genres       │   └────────────────────┘
└───────────────────┘

┌──────────────────────────────────────────┐
│           content_embedding              │
├──────────────────────────────────────────┤
│ content_id    STRING  (PK, composite)   │
│ content_type  STRING  (PK, composite)   │
│   (movie / book / song / game)          │
│ embedding     FLOAT[] (384-dim vector)  │
│ popularity_score FLOAT (0.0 – 100.0)   │
└──────────────────────────────────────────┘
```

**Key Design Decisions:**

- `content_embedding` uses a **composite primary key** `(content_id, content_type)` so a movie and a game can share the same numeric ID without collision.
- Embeddings are stored as PostgreSQL `ARRAY(Float)` — avoiding an external vector store while keeping the implementation simple.
- `popularity_score` is stored alongside the embedding so the scoring formula `0.8 × sim + 0.2 × pop` can be computed in pure NumPy from RAM.
- `user_interactions` uses a typed `weight` field to encode interaction strength: `onboard_anchor=1.5`, `like=1.0`, `superlike=2.0`, `dislike=-1.5`.

---

## 🚦 Getting Started

### Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** 15+ running locally or remotely
- A virtual environment tool (`venv`)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cross-recommendation-system.git
cd cross-recommendation-system
```

---

### 2. Backend Setup

```bash
# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

**Configure your `.env` file** (see [Environment Variables](#-environment-variables)), then:

```bash
# Seed the database with content (run once)
python scripts/load_movies.py
python scripts/load_books.py
python scripts/load_games.py
python scripts/hybrid_fetch_songs.py

# Load keywords for all content
python scripts/load_movie_keywords.py
python scripts/load_book_keywords.py
python scripts/load_game_keywords.py

# Generate semantic embeddings for all content (may take several minutes)
python scripts/embedding_calcualtion.py

# Calculate popularity scores
python scripts/recalculate_popularity.py

# Start the backend server
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at: `http://localhost:5173`

---

## 🌍 Environment Variables

Create a `.env` file in the project root with the following variables:

### Backend (`/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | JWT signing secret (use a long random string) |
| `ALGORITHM` | ✅ | JWT algorithm (e.g. `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | Token lifetime in minutes |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `TMDB_API_KEY` | ✅ | The Movie Database API key |
| `GOOGLE_BOOKS_API_KEY` | ✅ | Google Books API key |
| `SPOTIFY_CLIENT_ID` | ✅ | Spotify Developer client ID |
| `SPOTIFY_CLIENT_SECRET` | ✅ | Spotify Developer client secret |
| `RAWG_API_KEY` | ✅ | RAWG Games API key |
| `LASTFM_API_KEY` | ⚡ Optional | Last.fm API key for song data |
| `IGDB_CLIENT_ID` | ⚡ Optional | IGDB (Twitch) client ID for games |
| `IGDB_CLIENT_SECRET` | ⚡ Optional | IGDB client secret |

```bash
# Example .env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/crossrec
SECRET_KEY=your-very-long-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
TMDB_API_KEY=your-tmdb-api-key
GOOGLE_BOOKS_API_KEY=your-google-books-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
RAWG_API_KEY=your-rawg-api-key
```

### Frontend (`/frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend base URL (e.g. `http://localhost:8000`) |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID (same as backend) |

---

## 📸 Screenshots

<details>
<summary><strong>Click to view all screenshots</strong></summary>

### 🌐 Landing Page
![Landing Page](./screenshots/landingpage.png)
*The landing page featuring the animated poster wall, hero section, features, and the interactive "Try It Out" demo.*

---

### 🔐 Login
![Login](./screenshots/login.png)
*Clean login page supporting both email/password and one-click Google OAuth sign-in.*

---

### 📝 Signup
![Signup](./screenshots/signup.png)
*Registration page with real-time username and email availability checking.*

---

### 🎉 Onboarding

<table>
  <tr>
    <td align="center"><img src="./screenshots/onboarding1.png" alt="Onboarding Step 1"/><br/><sub><b>Step 1</b> — Pick your favourites</sub></td>
    <td align="center"><img src="./screenshots/onboarding2.png" alt="Onboarding Step 2"/><br/><sub><b>Step 2</b> — Refine preferences</sub></td>
    <td align="center"><img src="./screenshots/onboarding3.png" alt="Onboarding Step 3"/><br/><sub><b>Step 3</b> — Ready to go!</sub></td>
  </tr>
</table>

---

### 🏠 Dashboard
![Dashboard](./screenshots/dashboard.png)
*Personalized home feed with cross-domain recommendations tailored to your taste profile.*

---

### 🗺️ Explore
![Explore](./screenshots/explore.png)
*Browse and search across all content domains — movies, books, songs, and games — simultaneously.*

---

### 🎯 Recommendations
![Recommendations](./screenshots/recommendation.png)
*Cross-domain recommendations with semantic match confidence scores (0–100%).*

---

### 📚 Library
![Library](./screenshots/library.png)
*Your personal saved content library — bookmark anything across all domains.*

</details>

---

## 📈 Performance

### In-Memory Embedding Cache

The entire embedding matrix (all content vectors) is loaded into RAM on the **first recommendation request** and cached for the server's lifetime. Subsequent requests skip the database entirely and run a vectorized NumPy dot-product in milliseconds.

```python
# All embeddings pre-normalized and cached as a NumPy matrix
cache["matrix"] = np.array(normalized_vectors)  # shape: (N, 384)
similarities = np.dot(cache["matrix"], query_vector)  # O(N) vectorized
```

### Optimizations In Place

| Optimization | Description |
|---|---|
| 🧠 Model pre-loading | `all-MiniLM-L6-v2` loaded into RAM on startup, not per-request |
| ⚡ Embedding matrix cache | ~10–15s initial load, then near-instant similarity search |
| 🔄 Dynamic cache update | New embeddings appended to cache without full reload |
| 📦 Batch metadata fetches | `batch_resolve_metadata()` uses `IN` queries, not N+1 |
| 📋 Title dictionary cache | All titles pre-loaded to avoid per-search DB queries |
| 🗜️ L2 pre-normalization | Vectors normalized once at cache load, not per-query |

### Expected Latency (local machine)

| Operation | Expected Time |
|---|---|
| First request (cache cold) | ~10–15 seconds |
| Subsequent recommendations | ~50–200 ms |
| Text search (Stage 1–2) | ~5–20 ms |
| External API fallback (Stage 3) | ~500–2000 ms |

---

## 🔮 Future Improvements

<details>
<summary>View Roadmap</summary>

### 🧠 Intelligence

- [ ] **Collaborative Filtering** — "Users who liked X also liked Y" layer on top of semantic similarity
- [ ] **User Preference Learning** — Continuously update taste vectors as users interact
- [ ] **Hybrid Recommendation** — Blend semantic + collaborative + content-based signals
- [ ] **LLM-Powered Explanations** — Use a language model to generate natural-language explanation of why each item was recommended
- [ ] **Mood-based Recommendations** — Let users describe how they feel and get matching content
- [ ] **Recommendation Clusters** — Group recommendations into thematic bundles

### ⚡ Features

- [ ] **Watchlist / Readlist / Playlist** — Full save-for-later system with progress tracking
- [ ] **Like / Dislike on Recommendations** — Inline feedback to continuously improve the feed
- [ ] **Trending Content** — Surface what is hot across the community right now
- [ ] **Social Profiles** — Share your taste profile and follow other users
- [ ] **Notification System** — Alert users when new content similar to their tastes is added

### 🏗️ Infrastructure

- [ ] **pgvector Integration** — Replace `ARRAY(Float)` with native PostgreSQL vector operations for ANN search
- [ ] **Redis Caching** — Persist embedding cache across restarts and multiple workers
- [ ] **Celery Background Jobs** — Async embedding generation and data refresh tasks
- [ ] **Docker Compose** — One-command local setup for backend + DB + frontend
- [ ] **CI/CD Pipeline** — Automated testing and deployment workflows

</details>

---

## 🤝 Contributing

Contributions are welcome! Here is how to get involved:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with clear messages:
   ```bash
   git commit -m "feat: add collaborative filtering layer"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request describing your changes

### Development Guidelines

- Follow existing code structure and naming conventions
- Add Pydantic schemas for any new API endpoints
- Keep service functions pure and separated from route handlers
- Run `npm run lint` before submitting frontend changes
- Write descriptive commit messages following [Conventional Commits](https://www.conventionalcommits.org/)

### Reporting Issues

Please open a GitHub Issue with:
- A clear title and description
- Steps to reproduce
- Expected vs. actual behaviour
- Your environment (OS, Python version, Node version)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for full details.

---

## 👥 Team

<div align="center">

*Built with ❤️ and a lot of cosine similarity by a team of 3.*

<br/>

| | Ayush Singh | Vraj Patel | Dhruv Harani |
|:---:|:---:|:---:|:---:|
| **GitHub** | [![GitHub](https://img.shields.io/badge/GitHub-@Aayushsinghh13-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Aayushsinghh13) | [![GitHub](https://img.shields.io/badge/GitHub-@vrajpatelm-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/vrajpatelm) | [![GitHub](https://img.shields.io/badge/GitHub-@DhruvHarani1-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/DhruvHarani1) |

</div>

---

<div align="center">

⭐ **If this project helped or inspired you, please give it a star!** ⭐

<br/>

<img src="https://img.shields.io/badge/Made%20with-Python-3776AB?style=flat-square&logo=python&logoColor=white"/>
&nbsp;
<img src="https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react&logoColor=black"/>
&nbsp;
<img src="https://img.shields.io/badge/Powered%20by-HuggingFace-FFD21E?style=flat-square&logo=huggingface&logoColor=black"/>
&nbsp;
<img src="https://img.shields.io/badge/DB-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white"/>

</div>
