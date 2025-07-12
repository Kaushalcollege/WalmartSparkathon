# routes/extract_images.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.schemas import ExtractRequest
from models import ProductSession
from db import SessionLocal
import os
from PIL import Image
import pytesseract

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/extract-images")
def extract_images(req: ExtractRequest, db: Session = Depends(get_db)):
    session = db.query(ProductSession).filter_by(session_id=req.session_id).first()
    if session is None:
        return {"error": "Session not found."}
    
    session_dir = os.path.join("uploaded_images", req.session_id)
    all_text = ""
    for fname in session.filename.split(","):
        fname = fname.strip()
        if not fname:
            continue
        fpath = os.path.join(session_dir, fname)
        if os.path.exists(fpath):
            try:
                img = Image.open(fpath)
                all_text += pytesseract.image_to_string(img) + "\n"
            except Exception as e:
                all_text += f"[Error reading {fname}: {str(e)}]\n"
    session.raw_text = all_text
    db.commit()
    return {"message": "Text extracted from images", "snippet": all_text[:300]}
