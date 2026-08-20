"""Inspect what the vector index actually returns for a question.

Use this before blaming the model: if the retrieved chunks are wrong, no
prompt change will fix the answer.

    python query_db.py "What did Harshit do at ISRO?"
"""

from __future__ import annotations

import sys

import chromadb
from dotenv import load_dotenv

from embeddings import COLLECTION_NAME, DB_PATH, GeminiEmbeddingFunction

load_dotenv()

DEFAULT_QUESTION = "What kind of work did Harshit do at ISRO?"


def query_knowledge_base(question: str, n_results: int = 4) -> None:
    client = chromadb.PersistentClient(path=DB_PATH)

    # The previous version loaded a SentenceTransformer model here while the
    # index was built with Gemini embeddings — different dimensions, so every
    # result was meaningless. Always use the shared function.
    collection = client.get_collection(
        name=COLLECTION_NAME, embedding_function=GeminiEmbeddingFunction()
    )

    results = collection.query(query_texts=[question], n_results=n_results)

    documents = results["documents"][0]
    distances = results["distances"][0]
    metadatas = results["metadatas"][0]

    print(f"\nQuestion: {question}")
    print("-" * 72)
    for rank, (doc, distance, meta) in enumerate(zip(documents, distances, metadatas), start=1):
        print(f"\n[{rank}] distance={distance:.4f}  section={meta.get('section', '?')}")
        print(doc)
    print("-" * 72)
    print("Lower distance = closer match. main.py drops anything above MAX_CONTEXT_DISTANCE.")


if __name__ == "__main__":
    query_knowledge_base(" ".join(sys.argv[1:]) or DEFAULT_QUESTION)
