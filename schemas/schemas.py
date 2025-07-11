from pydantic import BaseModel
from typing import Dict, Optional

class UploadResponse(BaseModel):
    session_id: str
    filename: str
    message: str

class ExtractRequest(BaseModel):
    session_id: str

class GenerateRequest(BaseModel):
    session_id: str

class SubmitRequest(BaseModel):
    session_id: str
    data: Dict[str, str]