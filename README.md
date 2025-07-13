# Walmart Sparkathon – Product Data Extraction and Categorization Platform

## Overview

This project provides an automated solution for extracting, structuring, and categorizing product data from vendor catalogs (PDFs and images) for online retail platforms. It combines OCR, LLM-based field extraction, and a modern frontend-backend stack to streamline product onboarding for e-commerce.

---

## Motivation

Manual data entry from supplier catalogs is tedious, error-prone, and not scalable for large online retailers. This solution automates extraction and enrichment of product data, reducing manual labor and increasing speed and accuracy for catalog uploads.

---

## Core Features

- Upload vendor catalogs in PDF or image format
- Automatic OCR text extraction
- AI-driven product attribute extraction (product name, category, brand, GTIN/EAN/ISBN, features, compliance tags)
- Automated category suggestion
- UI for review and manual correction
- Batch/multi-product catalog support
- Export data as JSON or CSV

---

## Tech Stack

Frontend: React.js, TailwindCSS
Backend: FastAPI (Python 3.9+)
Database: SQLite (for demo; can use PostgreSQL or MySQL)
ML/NLP: OpenAI GPT or similar LLM, Tesseract OCR
Other: Axios, React Router, SQLAlchemy, Pydantic

---

## System Architecture

User uploads PDF/image via React frontend.
Frontend sends the file to the FastAPI backend.
Backend performs OCR, then passes the extracted text to LLM for structured field extraction.
Extracted product data is sent back to the frontend for review and correction.
User can approve, export, or download the structured data.

---

## Folder Structure

WalmartSparkathon/
backend/
main.py
models.py
schemas.py
services/
ocr_utils.py
llm_utils.py
db.py
requirements.txt
...
frontend/
src/
App.js
UploadPage.js
ReviewPage.js
...
public/
package.json
...
tests/
backend/
frontend/
.env.example
README.md
...

---

## Setup and Installation

1. Clone the repository

git clone [https://github.com/Kaushalcollege/WalmartSparkathon.git](https://github.com/Kaushalcollege/WalmartSparkathon.git)
cd WalmartSparkathon

2. Backend Setup

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

Configure your LLM API keys and database URLs in .env

3. Frontend Setup

cd ../frontend
npm install

---

## Running the Application

Start Backend

cd backend
uvicorn main\:app --reload

API available at [http://localhost:8000](http://localhost:8000)

Start Frontend

cd frontend
npm start

Frontend available at [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

POST /upload — Upload PDF/image
GET /session/{id} — Get extracted product data
POST /submit — Submit reviewed/corrected product data
POST /extract — Run field extraction on raw OCR text

See backend/main.py and backend/schemas.py for details.

---

## Frontend Usage

1. Upload a product catalog via upload page
2. Review and correct extracted data
3. Approve and export/download the final data

---

## Demo Data and Testing

Sample vendor PDFs are in demo_data/
Backend tests are in tests/backend/
Frontend tests are in tests/frontend/

Run backend tests:

cd backend
pytest

---

## Deployment

Backend can run on any VM (AWS, GCP, Azure, DigitalOcean).
Dockerization is supported via a Dockerfile.
Frontend can be deployed on Vercel, Netlify, or any static host.
Configure all secrets and keys via environment variables.

---

## Dependencies

Backend requirements (see backend/requirements.txt):

- fastapi
- uvicorn
- sqlalchemy
- pydantic
- requests
- tesserocr or pytesseract
- python-dotenv
- openai or other LLM SDK

Frontend requirements (see frontend/package.json):

- react
- react-dom
- react-router-dom
- axios
- tailwindcss

---

## Contributing

Fork the repository and create a feature branch.
Open a pull request with clear description of your changes.
For large changes, open an issue first to discuss.

---

## Troubleshooting

- Ensure all API keys are set in backend .env
- Tesseract OCR must be installed and available
- For LLM errors, check API keys and quotas
- For CORS errors, verify frontend and backend origins

---

## License

MIT License. See LICENSE file for details.

---

## Contact

For support, open an issue in the GitHub repo or contact the maintainer via the email in the GitHub profile.

---
