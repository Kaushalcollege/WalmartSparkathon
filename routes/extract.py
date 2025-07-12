from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.schemas import ExtractRequest
from models import ProductSession
from services.file_utils import extract_text_from_pdf
from db import SessionLocal
import os
from PIL import Image
import pytesseract
import json

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/extract")
def extract(req: ExtractRequest, db: Session = Depends(get_db)):
    print(f"[extract.py] Called with session_id: {req.session_id}")
    session = db.query(ProductSession).filter_by(session_id=req.session_id).first()
    if session is None:
        print("[extract.py] ERROR: Session not found.")
        return {"error": "Session not found."}

    # PDF extraction
    if session.filename.lower().endswith('.pdf'):
        filepath = f"data/{req.session_id}_{session.filename}"
        print(f"[extract.py] PDF filepath: {filepath}")
        if not os.path.exists(filepath):
            print("[extract.py] ERROR: File not found.")
            return {"error": "File not found."}
        text = extract_text_from_pdf(filepath)
        session.raw_text = text
        db.commit()
        db.refresh(session)
        print("[extract.py] PDF raw_text committed to DB (first 200 chars):", repr(session.raw_text[:200]))
        return {"message": "Text extracted from PDF", "snippet": text[:300]}

    # Image extraction (filenames stored as JSON string)
    session_dir = os.path.join("uploaded_images", req.session_id)
    print(f"[extract.py] Image session_dir: {session_dir}")

    try:
        filenames = json.loads(session.filename)
    except Exception as e:
        print("[extract.py] ERROR loading filenames JSON:", e)
        filenames = []

    all_text = ""
    for fname in filenames:
        fpath = os.path.join(session_dir, fname)
        print(f"[extract.py] Processing image: {fpath}")
        if os.path.exists(fpath):
            try:
                img = Image.open(fpath)
                ocr_text = pytesseract.image_to_string(img)
                print(f"[extract.py] OCR text from {fname} (first 100 chars):", repr(ocr_text[:100]))
                all_text += ocr_text + "\n"
            except Exception as e:
                err_text = f"[Error reading {fname}: {str(e)}]\n"
                print("[extract.py] ERROR:", err_text)
                all_text += err_text
        else:
            print(f"[extract.py] WARNING: Image not found at {fpath}")
    session.raw_text = all_text
    db.commit()
    db.refresh(session)
    print("[extract.py] Images raw_text committed to DB (first 200 chars):", repr(session.raw_text[:200]))
    return {"message": "Text extracted from images", "snippet": all_text[:300]}
