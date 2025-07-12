import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
import httpx

GROQ_API_KEY = os.getenv("GROQ_API_KEY") or "sk-..."  # Insert your Groq key

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchRequest(BaseModel):
    extracted_category: Optional[str]
    extracted_subcategory: Optional[str]
    extracted_product_type: Optional[str]
    product_name: Optional[str]

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama3-70b-8192"

@app.post("/match-categories")
async def match_categories(req: MatchRequest):
    prompt = build_prompt(req)
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert product classifier for an e-commerce site. "
                    "Given product fields (and especially the product name), always infer: "
                    "- category (main product group)\n"
                    "- subcategory (subcategory or use the most relevant if not explicit)\n"
                    "- product_type (most specific type or product name)\n"
                    "ALSO return a list of the 5 most probable options for each dropdown field, as arrays.\n"
                    "Example output:\n"
                    '{\n'
                    '  "category": "Electronics",\n'
                    '  "category_options": ["Electronics", "Home Appliances", ...],\n'
                    '  "subcategory": "Phones",\n'
                    '  "subcategory_options": ["Phones", "Tablets", ...],\n'
                    '  "product_type": "Smartphone",\n'
                    '  "product_type_options": ["Smartphone", "Feature Phone", ...]\n'
                    '}\n'
                    "If a field can't be inferred, leave its value as an empty string and the options array empty. Respond ONLY with a valid JSON object."
                ),
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 512,
        "temperature": 0,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(GROQ_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            answer = data['choices'][0]['message']['content']
            result = parse_llm_output(answer)
            return result
    except Exception as e:
        return {
            "category": "",
            "category_options": [],
            "subcategory": "",
            "subcategory_options": [],
            "product_type": "",
            "product_type_options": [],
            "error": str(e)
        }

def build_prompt(req: MatchRequest) -> str:
    return f"""
Here are product details. Extract the most likely values for category, subcategory, and product type, and generate 5 likely options for each (as arrays).

Extracted fields:
- Category: {req.extracted_category}
- Subcategory: {req.extracted_subcategory}
- Product Type: {req.extracted_product_type}
- Product Name: {req.product_name}

Respond ONLY with valid JSON as described before.
""".strip()

def parse_llm_output(output: str) -> dict:
    import json, re
    match = re.search(r"\{[\s\S]*\}", output)
    if not match:
        raise ValueError("LLM did not return JSON")
    return json.loads(match.group(0))
