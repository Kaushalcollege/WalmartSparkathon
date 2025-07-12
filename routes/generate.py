# routes/generate.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.schemas import GenerateRequest
from models import ProductSession
from services.llm_utils import generate_fields
from db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/generate-fields")
def generate(req: GenerateRequest, db: Session = Depends(get_db)):
    session = db.query(ProductSession).filter_by(session_id=req.session_id).first()
    if not session or not session.raw_text:
        raise HTTPException(status_code=400, detail="Raw text missing; please call /extract first")

    result = generate_fields(session.raw_text)
    parsed = result.get("fields", {})
    session.fields = parsed
    db.commit()
    return {"fields": parsed}
