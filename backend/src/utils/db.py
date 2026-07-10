from sqlalchemy import create_engine # It manages connections pooling, and SQL interaction with the DB
from sqlalchemy.orm import sessionmaker # a temporary transactional interaction with the database for executing queries and managing changes.  
from sqlalchemy.orm import declarative_base  #this creates orm 
from src.utils.settings import settings


Base = declarative_base()

engine = create_engine(url=settings.DB_CONNECTION)

LocalSession = sessionmaker(bind=engine) #creates Session objects ,connects Sessions to the database Engine.

def get_db():
    session = LocalSession()
    try:
        yield session
    finally:
        session.close()