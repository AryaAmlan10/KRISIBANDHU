
from google import genai
from google.genai import types

from backend.app.config import GEMINI_API_KEY, GEMINI_MODEL

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=GEMINI_API_KEY)


# TEXT QUESTION ANSWERING
def generate_answer(question: str, use_rag: bool = False):

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=question
    )

    return response.text


# IMAGE ANALYSIS
def analyze_image(image_bytes: bytes, mime_type: str, question: str):

    prompt = f"""
    You are KRISIBANDHU, an agricultural assistant.

    Analyze the uploaded farming image.

    User question: {question}

    Identify visible crop or soil characteristics.
    Provide practical farming guidance.
    If something cannot be identified clearly,
    explain that you are uncertain.

    Give a simple and helpful answer to the farmer.
    """

    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type
    )

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[prompt, image_part]
    )

    return response.text
