import os
import re
import requests

# Load your GROQ API key from environment for security
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def extract_structured_fields(response_text: str) -> dict:
    """
    Parse LLM Markdown response into a structured dict.
    Supports bolded keys (**Key**:) and falls back to plain Key: lines.
    """
    fields = {}

    # 1️⃣ Primary extraction: look for **Key**: Value lines
    matches = re.findall(r"\*\*(.*?)\*\*:\s*(.+)", response_text)
    if not matches:
        # 2️⃣ Fallback extraction: plain Key: Value (multi-line support)
        matches = re.findall(r"^([\w &]+):\s*(.+)$", response_text, flags=re.MULTILINE)

    for key, value in matches:
        key = key.strip()
        # If this field contains bullet lists, split into Python list
        if key.lower().startswith("key features") or key.lower().startswith("compliance tags"):
            lines = value.strip().split("\n")
            value = [line.strip("* ").strip() for line in lines if line.strip()]
        else:
            value = value.strip()
        fields[key] = value

    return fields

def generate_fields(text: str) -> dict:
    """
    Call the LLM to extract structured product listing fields from raw text.
    The LLM is prompted to output bolded keys and values for easy parsing.
    """
    prompt = f"""
You are an elite information extraction agent.
You will receive raw OCR or text dump from a real-world product PDF. The input may contain:
- Visual clutter (headers, footers, page numbers, colored or rotated text, decorative elements)
- Tables, lists, icons, or unusual formatting
- Random symbols, breaks, and noise from OCR

Your job:
1. Extract ONLY the required product fields (ignore all irrelevant/extra content).
2. Be robust to jumbled order, mixed or missing fields, and formatting errors.
3. If a field is absent, return "Not available".
4. For fields with multiple values (like images, features), return one bullet per line.
5. Output must be a pure key-value list, with **BOLD** keys and a colon for each, no extra text.

**Fields (always output these, even if "Not available"):**

**Product ID**:
**EAN**:
**GTIN**:
**ISBN**:
**UPC**:
**Category**:
**Subcategory**:
**SKU**:
**Product name**:
**Site description**:
**Key features**:
**Brand name**:
**Fulfillment option**:
**Type of condition**:
**Image URLs**:
**Selling Price**:

--- Begin product PDF content (up to 3000 characters) ---

{text[:3000]}
"""

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3-70b-8192",
                "messages": [
                    {"role": "system", "content": "You are an AI that extracts product listing data in a highly structured format."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            },
            timeout=20
        )

        response.raise_for_status()
        result = response.json()

        raw_text = result["choices"][0]["message"]["content"]

        # Parse LLM output into structured dict
        parsed_fields = extract_structured_fields(raw_text)
        return {"fields": parsed_fields}

    except requests.exceptions.RequestException as e:
        print("LLM request failed:", e)
        return {"fields": {"error": "LLM request failed"}}
    except (KeyError, IndexError) as e:
        print("Parsing error:", e)
        return {"fields": {"error": "Unexpected LLM response format"}}
