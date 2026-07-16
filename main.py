import os
from dotenv import load_dotenv
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

app = FastAPI(title="Portfolio RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# NEW: Custom Wrapper to bypass the broken Chroma package
# ---------------------------------------------------------
class LangchainGeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self):
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing! Check your .env file.")
            
        # FIX: Use the new standard model gemini-embedding-001
        self.encoder = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            google_api_key=api_key
        )
        
    def __call__(self, input: Documents) -> Embeddings:
        return self.encoder.embed_documents(input)

# Connect to the database
client = chromadb.PersistentClient(path="./portfolio_db")

embedding_func = LangchainGeminiEmbeddingFunction()

collection = client.get_collection(
    name="harshit_portfolio",
    embedding_function=embedding_func
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.3
)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an AI assistant integrated into Harshit Poddar's portfolio. 
    Answer questions about Harshit's experience, projects, and skills based ONLY on the provided context. 
    If the answer is not in the context, politely say you don't know and suggest the user contact Harshit directly.
    Keep answers concise, professional, and directly related to the user's prompt.
    
    Context:
    {context}"""),
    ("human", "{question}")
])

chain = prompt | llm | StrOutputParser()

class QueryRequest(BaseModel):
    question: str

@app.post("/chat")
async def chat_endpoint(request: QueryRequest):
    try:
        results = collection.query(
            query_texts=[request.question],
            n_results=3
        )
        retrieved_context = "\n\n".join(results['documents'][0])
        response = await chain.ainvoke({
            "context": retrieved_context,
            "question": request.question
        })
        return {"answer": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "Online", "system": "RAG Chatbot Active"}