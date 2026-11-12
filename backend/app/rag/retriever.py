
import faiss
import numpy as np
import json
from pathlib import Path

VECTOR_DIR = Path("vector_store")
INDEX_PATH = VECTOR_DIR / "farming.index"
DATA_PATH = VECTOR_DIR / "chunks.json"


def save_vector_store(chunks, embeddings):
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)

    vectors = np.array(embeddings, dtype="float32")

    faiss.normalize_L2(vectors)

    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)

    faiss.write_index(index, str(INDEX_PATH))

    with open(DATA_PATH, "w", encoding="utf-8") as file:
        json.dump(chunks, file, ensure_ascii=False, indent=2)

    print("FAISS vector store saved successfully!")


def search_documents(query_embedding, top_k=3):
    if not INDEX_PATH.exists() or not DATA_PATH.exists():
        raise FileNotFoundError("Vector store not found. Build it first.")

    index = faiss.read_index(str(INDEX_PATH))

    with open(DATA_PATH, "r", encoding="utf-8") as file:
        chunks = json.load(file)

    query_vector = np.array([query_embedding], dtype="float32")
    faiss.normalize_L2(query_vector)

    scores, indices = index.search(
        query_vector,
        min(top_k, len(chunks))
    )

    results = []

    for score, idx in zip(scores[0], indices[0]):
        if idx >= 0:
            results.append({
                **chunks[idx],
                "score": float(score)
            })

    return results
