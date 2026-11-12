
from google import genai
from backend.app.config import GEMINI_API_KEY

EMBEDDING_MODEL = "gemini-embedding-001"

client = genai.Client(api_key=GEMINI_API_KEY)


def create_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts
    )

    return [item.values for item in response.embeddings]
