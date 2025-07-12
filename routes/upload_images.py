from fastapi import APIRouter, UploadFile, File, Depends
from uuid import uuid4
import os
import json
from PIL import Image
import pytesseract
from sqlalchemy.orm import Session
from db import SessionLocal
from models import ProductSession

router = APIRouter()
UPLOAD_DIR = "uploaded_images"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload-images")
async def upload_images(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    session_id = str(uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    texts = []
    filenames = []

    for file in files:
        file_path = os.path.join(session_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        # Optional: OCR here if you want instant preview (not required)
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
        except Exception as e:
            text = f"[Error OCR on {file.filename}: {str(e)}]"
        texts.append(text)
        filenames.append(file.filename)

    # Save all OCR text (optional)
    with open(os.path.join(session_dir, "extracted_text.txt"), "w") as f:
        f.write("\n".join(texts))

    # Store session in DB, using JSON for filenames!
    filenames_str = json.dumps(filenames)
    db.add(ProductSession(session_id=session_id, filename=filenames_str, raw_text=""))
    db.commit()

    print(f"[upload_images.py] session_id={session_id} | filenames={filenames}")
    return {"session_id": session_id, "filenames": filenames}
