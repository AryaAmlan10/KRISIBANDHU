
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from backend.app.services.gemini_service import (
    generate_answer,
    analyze_image
)

router = APIRouter()


# TEXT CHAT REQUEST
class ChatRequest(BaseModel):
    question: str
    use_rag: bool = False


class ChatResponse(BaseModel):
    question: str
    answer: str


# EXISTING TEXT CHAT API
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

    except Exception as e:
        print("Chat error:", e)

        raise HTTPException(
            status_code=503,
            detail="Unable to generate an answer. Please try again."
        )


# NEW IMAGE UPLOAD API
@router.post("/analyze-image")
async def upload_image(
    file: UploadFile = File(...),
    question: str = Form("Please analyze this farming image.")
):

    try:
        # Validate image type
        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPG, PNG and WEBP images are allowed."
            )

        # Read image
        image_bytes = await file.read()

        # Validate image size (maximum 10 MB)
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image size must be less than 10 MB."
            )

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Please upload an image."
            )

        # Send image to Gemini
        answer = analyze_image(
            image_bytes=image_bytes,
            mime_type=file.content_type,
            question=question
        )

        return {
            "question": question,
            "filename": file.filename,
            "answer": answer
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Image analysis error:", e)

        raise HTTPException(
            status_code=503,
            detail="Unable to analyze the image. Please try again."
        )

    finally:
        await file.close()

