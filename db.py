from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# DATABASE_URL='postgresql://postgres:Prince@2709@localhost:5432/walmart_ai'
DATABASE_URL = 'postgresql://postgres:Prince%402709@localhost:5432/walmart_ai'


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()