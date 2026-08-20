"""Shared embedding function.

Both build_db.py and main.py must embed with the *same* model, or the query
vectors land in a different space from the stored ones and retrieval quietly
returns garbage. Defining it once here makes that impossible to get wrong —
previously the class was copy-pasted into both files.
"""

from __future__ import annotations

import os

from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings

EMBEDDING_MODEL = "gemini-embedding-001"
COLLECTION_NAME = "harshit_portfolio"
DB_PATH = os.environ.get("CHROMA_PATH", "./portfolio_db")


class GeminiEmbeddingFunction(EmbeddingFunction):
    """Adapts LangChain's Gemini embeddings to Chroma's interface."""

    def __init__(self, api_key: str | None = None) -> None:
        key = (api_key or os.environ.get("GOOGLE_API_KEY", "")).strip()
        if not key:
            raise ValueError("GOOGLE_API_KEY is not set — add it to .env or the environment.")
        self.encoder = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL, google_api_key=key
        )

    def __call__(self, input: Documents) -> Embeddings:  # noqa: A002 - Chroma's signature
        return self.encoder.embed_documents(input)

    @staticmethod
    def name() -> str:
        """Chroma persists this to detect embedding-function mismatches."""
        return f"gemini-{EMBEDDING_MODEL}"
