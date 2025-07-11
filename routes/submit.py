from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.schemas import SubmitRequest
from models import ProductSession
from db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/submit")
def submit(req: SubmitRequest, db: Session = Depends(get_db)):
    session = db.query(ProductSession).filter_by(session_id=req.session_id).first()
    if not session:
        return {"error": "Session not found"}

    session.final_submission = req.data
    session.status = "submitted"
    db.commit()
    return {"message": "Product submitted successfully"}
