from sqlalchemy import Column, String, Text, JSON
from db import Base

class ProductSession(Base):
    __tablename__ = "sessions"
    session_id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    raw_text = Column(Text)
    fields = Column(JSON)
    final_submission = Column(JSON)
    status = Column(String, default="uploaded")