from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = (
    "postgresql+psycopg://postgres:password@localhost/mydb"
)

engine = create_engine(DATABASE_URL)

# communication to db establish
SessionLocal = sessionmaker(bind=engine)
class Base(DeclarativeBase):
    pass