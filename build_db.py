import chromadb
from chromadb.utils import embedding_functions
from langchain_text_splitters import RecursiveCharacterTextSplitter

def build_knowledge_base():
    # 1. Initialize ChromaDB to save to a local folder
    client = chromadb.PersistentClient(path="./portfolio_db")
    
    # 2. Set up the embedding model (Chroma will automatically download all-MiniLM-L6-v2)
    embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    
    # 3. Create or load the collection
    collection = client.get_or_create_collection(
        name="harshit_portfolio",
        embedding_function=embedding_func
    )

    # 4. Your raw portfolio and CV data 
    #[cite: 1, 4]
    raw_data = [
        "Harshit Poddar is a Machine Learning Engineer and M.Sc. student at KTH Royal Institute of Technology in Stockholm. He specializes in Computer Vision, Multimodal AI, LLMs, and scalable MLOps.",
        "Harshit works as a Systems Simulation Engineer at AESIR (KTH Rocketry), developing the Freyja HIL system to simulate aerospace sub-systems and validate embedded flight software.",
        "Harshit is a Student Researcher at the Robotics Perception and Learning (RPL) Lab, prototyping a multimodal AI navigation system integrating computer vision and audio processing alongside the KTH AI Society.",
        "Harshit developed LungMate, a hybrid Computer Vision system utilizing EfficientNet-B3, Swin Transformer, and YOLOv11 for multi-metric lung cancer diagnosis, integrated with a PyQt GUI.",
        "During his Research Internship at ISRO, Harshit optimized a 16x16 Phased Antenna Array for MEOSAR satellite signals, achieving over 20% SNR improvement using MVDR and LCMV beamforming algorithms.",
        "At TATA Memorial Hospital (ACTREC), Harshit deployed U-Net and YOLOv8L for multi-organ nuclei segmentation on the MoNuSeg dataset, achieving higher accuracy and faster inference while using Grad-CAM and SHAP for explainability.",
        "Harshit engineered an Industrial IoT Safety Wearable using an ESP32, Sensor Fusion (MQ2 Gas, NEO-6M GPS), and LoRaWAN connectivity. A patent has been filed for this device."
    ]

    # 5. Split the text into optimal chunks for the LLM
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

    # 6. Insert into ChromaDB
    print(f"Adding {len(documents)} chunks to ChromaDB...")
    collection.upsert(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    print("Knowledge base successfully built and saved to ./portfolio_db!")

if __name__ == "__main__":
    build_knowledge_base()