import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import dotenv
dotenv.load_dotenv()
PASSOWRD=os.getenv("POSTGRES_PASSWORD")
DATABASE_URL = (
   f"postgresql://postgres:{PASSOWRD}@localhost:5433/recommendation_system"
)

engine = create_engine(DATABASE_URL)

# communication to db establish
SessionLocal = sessionmaker(bind=engine)
class Base(DeclarativeBase):
    pass