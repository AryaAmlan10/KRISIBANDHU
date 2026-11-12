
from backend.app.services.gemini_service import generate_answer

try:
    answer = generate_answer("Hello! Introduce yourself as a farming assistant.")
    print("\nGemini Response:")
    print(answer)

except Exception as e:
    print("\nGemini Error:")
    print(e)
