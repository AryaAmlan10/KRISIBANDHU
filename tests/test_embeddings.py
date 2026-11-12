
from backend.app.rag.document_loader import load_documents
from backend.app.rag.chunking import split_documents
from backend.app.rag.embeddings import create_embeddings

try:
    documents = load_documents()
    print("Documents loaded:", len(documents))

    chunks = split_documents(documents)
    print("Text chunks created:", len(chunks))

    texts = [chunk["content"] for chunk in chunks]
    vectors = create_embeddings(texts)

    print("Embeddings created:", len(vectors))

    if vectors:
        print("Vector dimensions:", len(vectors[0]))

    print("Embedding test successful!")

except Exception as e:
    print("Embedding Error:", e)
