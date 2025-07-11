import requests
import re

import os
GROQ_API_KEY = os.getenv("GROQ_API_KEY")



def extract_structured_fields(response_text: str) -> dict:
    """
    Parse LLM response into structured JSON.
    """

    fields = {}

    matches = re.findall(r"\*\*(.*?)\*\*:\s*(.+)", response_text)
    for key, value in matches:
        
        if key.lower().startswith("key features") or key.lower().startswith("compliance tags"):
            value = [line.strip("* ").strip() for line in value.strip().split("\n") if line.strip()]
        fields[key.strip()] = value

    return fields

def generate_fields(text: str) -> dict:
    prompt = f"""
    Extract the following structured fields from the given product text, and return values that best fit the form:

    - Product ID (if present, else skip)
    - SKU
    - Product name
    - Site description
    - Key features (in bullet points)
    - Brand name
    - Fulfillment option (e.g., Seller Fulfilled, Walmart Fulfilled)
    - Type of condition (e.g., New, Used, Refurbished)
    - Image URLs (if available, else skip)

    Make sure the values are concise and clean, suitable to be filled into form fields on a product listing page.

    TEXT:
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
                    {"role": "system", "content": "You are an AI that extracts product listing data in structured format."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3
            },
            timeout=20
        )

        response.raise_for_status()
        result = response.json()
        raw_text = result["choices"][0]["message"]["content"]

        # Parsing response to json
        parsed_fields = extract_structured_fields(raw_text)

        return {"fields": parsed_fields}

    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return {"fields": {"error": "LLM request failed"}}
    except (KeyError, IndexError) as e:
        print("Parsing error:", e)
        return {"fields": {"error": "Unexpected LLM response format"}}
