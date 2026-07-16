import os
from dotenv import load_dotenv
import chromadb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chromadb.utils import embedding_functions
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load the secret keys from your .env file into the environment
load_dotenv()

# 1. Initialize FastAPI Application
app = FastAPI(title="Portfolio RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Setup ChromaDB Connection
client = chromadb.PersistentClient(path="./portfolio_db")
embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)
collection = client.get_collection(
    name="harshit_portfolio",
    embedding_function=embedding_func
)

# 3. Setup LangChain and Gemini
# LangChain will now automatically detect your GOOGLE_API_KEY from the environment
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.3
)

# Define the system prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an AI assistant integrated into Harshit Poddar's portfolio. 
    Answer questions about Harshit's experience, projects, and skills based ONLY on the provided context. 
    If the answer is not in the context, politely say you don't know and suggest the user contact Harshit directly.
    Keep answers concise, professional, and directly related to the user's prompt.
    
    Context:
    {context}"""),
    ("human", "{question}")
])

# Build the LangChain pipeline
chain = prompt | llm | StrOutputParser()

# 4. Define Data Models
class QueryRequest(BaseModel):
    question: str

# 5. Define API Endpoints
@app.post("/chat")
async def chat_endpoint(request: QueryRequest):
    try:
        # Step A: Retrieve context from ChromaDB
        results = collection.query(
            query_texts=[request.question],
            n_results=3
        )
        
        # Format the retrieved documents into a single string context
        retrieved_context = "\n\n".join(results['documents'][0])
        
        # Step B: Generate the response via LangChain + Gemini
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