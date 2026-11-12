
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.gemini_service import generate_answer

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    use_rag: bool = False


class ChatResponse(BaseModel):
    question: str
    answer: str


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        answer = generate_answer(
            question=request.question,
            use_rag=request.use_rag
        )

        return ChatResponse(
            question=request.question,
            answer=answer
        )

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to generate an answer. Please try again."
        )

