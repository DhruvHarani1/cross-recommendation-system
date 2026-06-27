from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(DATABASE_URL)

# communication to db establish
SessionLocal = sessionmaker(bind=engine)
class Base(DeclarativeBase):
    pass

#Dependency Injection:to get database session
def get_db():
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()