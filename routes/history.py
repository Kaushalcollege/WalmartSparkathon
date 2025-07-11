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

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    sessions = db.query(ProductSession).all()
    return [
        {
            "session_id": s.session_id,
            "filename": s.filename,
            "status": s.status,
        }
        for s in sessions
    ]
