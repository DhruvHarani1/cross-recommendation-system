"""
Standalone script to create all database tables.
Run from the project root:  python scripts/create_tables.py
"""
import sys, os

# Ensure the project root is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, Base
import models  # noqa: F401 — register all table definitions

print("Creating tables in:", engine.url)
Base.metadata.create_all(bind=engine)
print("[OK] All tables created successfully!")

# List the tables that were created
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"\nTables in database ({len(tables)}):")
for t in tables:
    print(f"   - {t}")
