import os
import pdfplumber
import fitz  # PyMuPDF
from io import StringIO
from pdfminer.high_level import extract_text_to_fp
from PIL import Image
import pytesseract

def extract_text_plumber(filepath: str) -> str:
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def extract_text_mupdf(filepath: str) -> str:
    text = ""
    doc = fitz.open(filepath)
    for page in doc:
        text += page.get_text("text") + "\n"
    return text

def extract_text_pdfminer(filepath: str) -> str:
    output = StringIO()
    with open(filepath, "rb") as fin:
        extract_text_to_fp(fin, output)
    return output.getvalue()

def ocr_page(page) -> str:
    # page.to_image(resolution=300).original is already a PIL Image
    pil = page.to_image(resolution=300).original
    return pytesseract.image_to_string(pil)  # FIX: use pil directly!

def extract_text_from_pdf(filepath: str) -> str:
    # 1. Try pdfplumber
    text = extract_text_plumber(filepath)
    if text.strip():
        return text

    # 2. Try PyMuPDF
    text = extract_text_mupdf(filepath)
    if text.strip():
        return text

    # 3. Try PDFMiner
    text = extract_text_pdfminer(filepath)
    if text.strip():
        return text

    # 4. Fallback: OCR every page
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text += ocr_page(page) + "\n"
    return text
