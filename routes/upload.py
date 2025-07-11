from fastapi import APIRouter, UploadFile, File, Depends
import shutil, uuid, os
from sqlalchemy.orm import Session
from db import SessionLocal
from models import ProductSession
from schemas.schemas import UploadResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload", response_model=UploadResponse)
def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())
    path = f"data/{session_id}_{file.filename}"
    os.makedirs("data", exist_ok=True)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db.add(ProductSession(session_id=session_id, filename=file.filename))
    db.commit()

    return UploadResponse(session_id=session_id, filename=file.filename, message="Uploaded successfully.")
