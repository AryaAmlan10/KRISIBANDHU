
from backend.app.rag.document_loader import load_documents
from backend.app.rag.chunking import split_documents
from backend.app.rag.embeddings import create_embeddings
from backend.app.rag.retriever import save_vector_store


def build_index():
    print("Loading farming documents...")

    documents = load_documents()

    if not documents:
        print("No farming documents found!")
        return

    print("Splitting documents...")

    chunks = split_documents(documents)

    print("Generating embeddings...")

    texts = [chunk["content"] for chunk in chunks]
    embeddings = create_embeddings(texts)

    print("Saving FAISS vector store...")

    save_vector_store(chunks, embeddings)

    print("KRISIBANDHU knowledge base created successfully!")


if __name__ == "__main__":
    build_index()
