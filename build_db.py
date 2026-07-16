import os
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

# Load your local Google API Key
load_dotenv()


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

def build_knowledge_base():
    client = chromadb.PersistentClient(path="./portfolio_db")
    
    # Use our custom LangChain wrapper instead!
    embedding_func = LangchainGeminiEmbeddingFunction()
    
    # Wipe the old database if it exists
    try:
        client.delete_collection("harshit_portfolio")
    except Exception:
        pass

    collection = client.create_collection(
        name="harshit_portfolio",
        embedding_function=embedding_func
    )

    # Your raw portfolio data
    raw_data = [
        "Harshit Poddar is a Machine Learning Engineer and M.Sc. student at KTH Royal Institute of Technology in Stockholm. He specializes in Computer Vision, Multimodal AI, LLMs, and scalable MLOps.",
        "Harshit works as a Systems Simulation Engineer at AESIR (KTH Rocketry), developing the Freyja HIL system to simulate aerospace sub-systems and validate embedded flight software.",
        "Harshit is a Student Researcher at the Robotics Perception and Learning (RPL) Lab, prototyping a multimodal AI navigation system integrating computer vision and audio processing alongside the KTH AI Society.",
        "Harshit developed LungMate, a hybrid Computer Vision system utilizing EfficientNet-B3, Swin Transformer, and YOLOv11 for multi-metric lung cancer diagnosis, integrated with a PyQt GUI.",
        "During his Research Internship at ISRO, Harshit optimized a 16x16 Phased Antenna Array for MEOSAR satellite signals, achieving over 20% SNR improvement using MVDR and LCMV beamforming algorithms.",
        "At TATA Memorial Hospital (ACTREC), Harshit deployed U-Net and YOLOv8L for multi-organ nuclei segmentation on the MoNuSeg dataset, achieving higher accuracy and faster inference while using Grad-CAM and SHAP for explainability.",
        "Harshit engineered an Industrial IoT Safety Wearable using an ESP32, Sensor Fusion (MQ2 Gas, NEO-6M GPS), and LoRaWAN connectivity. A patent has been filed for this device."
    ]

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    
    documents = []
    metadatas = []
    ids = []

    for i, text in enumerate(raw_data):
        chunks = text_splitter.split_text(text)
        for j, chunk in enumerate(chunks):
            documents.append(chunk)
            metadatas.append({"source": f"portfolio_section_{i}"})
            ids.append(f"doc_{i}_chunk_{j}")

    print("Sending text to Google Gemini for vector embedding...")
    collection.upsert(documents=documents, metadatas=metadatas, ids=ids)
    print("Database successfully rebuilt using Google Embeddings via LangChain!")

if __name__ == "__main__":
    build_knowledge_base()