
from google import genai
from backend.app.config import GEMINI_API_KEY, GEMINI_MODEL
from backend.app.rag.embeddings import create_embeddings
from backend.app.rag.retriever import search_documents

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_answer(question: str, use_rag: bool = False) -> str:

    if not use_rag:
        prompt = f"""
        You are KRISIBANDHU, a helpful farming assistant.

        Answer the farmer's question clearly and simply.

        Farmer's question: {question}
        """

    else:
        query_embedding = create_embeddings([question])[0]

        results = search_documents(query_embedding, top_k=3)

        context = "\n\n".join(
            result["content"] for result in results
        )

        prompt = f"""
        You are KRISIBANDHU, a farming assistant.

        Answer the farmer using the farming information below.

        Farming information:
        {context}

        Farmer's question:
        {question}

        If the information is insufficient, clearly say so.
        Do not invent facts or claim information came from
        the documents when it did not.
        """

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    return response.text or "Sorry, I could not generate an answer."

