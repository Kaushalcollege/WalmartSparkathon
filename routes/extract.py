from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.schemas import ExtractRequest
from models import ProductSession
from services.file_utils import extract_text_from_pdf
from db import SessionLocal
import os

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/extract")
def extract(req: ExtractRequest, db: Session = Depends(get_db)):
    session = db.query(ProductSession).filter_by(session_id=req.session_id).first()
    filepath = f"data/{req.session_id}_{session.filename}"

    if not os.path.exists(filepath):
        return {"error": "File not found."}

    text = extract_text_from_pdf(filepath)
    session.raw_text = text
    db.commit()
    return {"message": "Text extracted", "snippet": text[:300]}
