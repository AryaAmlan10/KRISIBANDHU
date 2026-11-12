
from backend.app.rag.embeddings import create_embeddings
from backend.app.rag.retriever import search_documents

question = "What type of soil is suitable for growing corn?"

try:
    query_embedding = create_embeddings([question])[0]

    results = search_documents(query_embedding, top_k=2)

    print("\nRetrieved Farming Information:\n")

    for result in results:
        print("Source:", result["source"])
        print("Content:", result["content"])
        print("Score:", result["score"])
        print("-" * 40)

except Exception as e:
    print("Retrieval Error:", e)
