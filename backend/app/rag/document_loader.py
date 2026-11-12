
from pathlib import Path

DOCUMENTS_DIR = Path("documents")


def load_documents():
    documents = []

    for file_path in DOCUMENTS_DIR.rglob("*.txt"):
        text = file_path.read_text(encoding="utf-8")

        if text.strip():
            documents.append({
                "content": text,
                "source": str(file_path)
            })

    return documents
