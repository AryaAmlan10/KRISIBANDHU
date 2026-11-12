
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.chat import router as chat_router

app = FastAPI(
    title="KRISIBANDHU API",
    description="AI-powered Farming Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "Welcome to KRISIBANDHU",
        "status": "Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "Healthy",
        "project": "KRISIBANDHU"
    }

