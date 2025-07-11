from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import ProductSession
from db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/review/{session_id}")
def review(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ProductSession).filter_by(session_id=session_id).first()
    if not session:
        return {"error": "Session not found"}

    return {
        "filename": session.filename,
        "fields": session.fields or {},
        "status": session.status
    }
