"""Rebuild the portfolio vector index.

Run this whenever the CV changes:

    python build_db.py

The index is committed to the repo so Render does not need a Google API key at
build time — only at query time.

Keep KNOWLEDGE in sync with index.html and js/faq.js. Each entry is one
self-contained fact: retrieval works far better on short, standalone chunks
than on long paragraphs that mix three roles together.
"""

from __future__ import annotations

import chromadb
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter

from embeddings import COLLECTION_NAME, DB_PATH, GeminiEmbeddingFunction

load_dotenv()

# (section, text) — the section becomes metadata so answers can be traced back.
KNOWLEDGE: list[tuple[str, str]] = [
    # ---------------------------------------------------------------- profile
    (
        "profile",
        "Harshit Poddar is an AI engineer based in Stockholm, Sweden, studying for an "
        "M.Sc. in Machine Learning at KTH Royal Institute of Technology (August 2025 to "
        "June 2027). He specialises in generative AI, agentic AI, state-space models, "
        "agentic LLM orchestration, computer vision, physical AI and scientific machine "
        "learning. He is open to relocating anywhere in Europe.",
    ),
    (
        "availability",
        "Harshit is seeking graduate and full-time roles in AI and machine learning "
        "engineering (agentic AI, generative AI, applied ML), starting summer 2027 when his "
        "M.Sc. finishes, in Sweden or anywhere in Europe. Contact him by email at "
        "harshit10233@gmail.com. Do not share any phone number.",
    ),
    # ------------------------------------------------------------- experience
    (
        "experience:massive-dynamic",
        "At Massive Dynamic Sweden AB in Stockholm, Harshit has worked as a part-time AI "
        "Engineer since July 2026. He builds the AI orchestration layer for O-LISTIC, an "
        "automated cybersecurity-policy platform, converting a manual pipeline into an "
        "end-to-end agentic workflow. One of six policy-generation stages has been migrated "
        "to tool-calling agents so far. Each migrated stage is exposed as a tool-calling "
        "agent behind typed FastAPI endpoints with output validation, retry and fallback "
        "routing, and run tracing, so every generated policy is reproducible and auditable. "
        "Stack: Python, FastAPI, LLM APIs, agent orchestration, PostgreSQL, Git.",
    ),
    (
        "experience:karolinska",
        "At Karolinska Institutet in Stockholm, Harshit has been a summer intern since June "
        "2026. He generates over 5,000 synthetic realistic fixational eye-movement sequences "
        "by simulation, far more labelled sequences than lab measurement supplies, and owns "
        "the simulation-to-training pipeline including parameter sweeps, labelling, versioning "
        "and reproducible configs. He models the resulting time series with a state-space "
        "architecture in PyTorch, benchmarked against diffusion, DiffWave and GAN baselines on "
        "distributional agreement with recorded data. Further project details are confidential. "
        "Stack: Python, PyTorch, state-space models, Flow Matching, Linux.",
    ),
    (
        "experience:aesir",
        "From September 2025 to June 2026 Harshit was a Systems Simulation Engineer at AESIR, "
        "the KTH Rocketry team. He developed the Freyja hardware-in-the-loop system to simulate "
        "real-time aerospace sub-systems and ran test development and system validation for "
        "embedded flight software.",
    ),
    (
        "experience:tata-memorial",
        "At Tata Memorial Hospital (ACTREC) in India, Harshit was a research intern from "
        "November to December 2023. He benchmarked U-Net against YOLOv8-L for nuclei "
        "segmentation on the MoNuSeg dataset of 37 H&E slides across 7 organs. U-Net reached "
        "0.82 recall and 0.63 IoU with stronger boundary delineation, while YOLOv8-L ran about "
        "24 percent faster at 61 ms versus 80 ms with comparable precision. He applied Grad-CAM "
        "and SHAP so clinicians could review the models' reasoning.",
    ),
    (
        "experience:drdo",
        "At DRDO (Defence Research and Development Organisation) in India, Harshit was a summer "
        "intern from June to July 2024. He built an 8 by 60 phased-array model with a real-time "
        "MATLAB GUI and performed radar-degradation analysis for fault-tolerant system design.",
    ),
    (
        "experience:isro",
        "At ISRO (Indian Space Research Organisation), Harshit was a research intern from "
        "September to October 2023. He optimised a 16 by 16 phased antenna array for MEOSAR "
        "satellite signals in Ansys HFSS, using MVDR and LCMV beamforming algorithms to achieve "
        "over 20 percent SNR improvement.",
    ),
    (
        "experience:iim",
        "At the Indian Institute of Management, Trichy, Harshit was a research assistant from "
        "March to June 2023. He built Python ETL and NLP sentiment pipelines over 5,000-plus "
        "survey responses and 200-plus TV advertisements, using statistical modelling to "
        "quantify emotional impact across more than 10 persuasion metrics.",
    ),
    # ---------------------------------------------------------------- projects
    (
        "project:patchpilot",
        "PatchPilot is Harshit's autonomous code-healing agent, started June 2026. It is a "
        "LangGraph state machine that runs a Python program, intercepts the traceback, and "
        "either returns a verified past fix from semantic memory in pgvector when similarity "
        "exceeds 0.90, or asks Gemini 2.5 Flash for a patch, so an already-solved bug costs no "
        "LLM call. A human-in-the-loop gate guards every file write; the fix is then re-executed "
        "and written back as new memory. MLflow traces every prompt, token count and node "
        "latency. Stack: Python, LangGraph, Gemini API, Supabase with PostgreSQL and pgvector, "
        "MLflow, Streamlit.",
    ),
    (
        "project:lungmate",
        "LungMate is Harshit's AI-driven lung cancer diagnosis system, built November 2024 to "
        "April 2025. It is a hybrid detector replacing the YOLOv11s backbone with EfficientNet-B3, "
        "a Swin Transformer and CBAM attention, trained on 6,789 annotated CT scans across four "
        "lung-cancer classes. It reaches 91.05 percent mAP at IoU 0.5, 90.12 percent precision, "
        "84 percent accuracy and 2.35 ms inference. It derives tumour diameter, area, perimeter, "
        "volume and mass from 2D bounding boxes via a calibrated pixel-to-centimetre factor, "
        "removing the need for 3D reconstruction, and ships as a PyQt5 GUI with 15 "
        "image-processing modes. It was published at IEEE SENNET 2025.",
    ),
    (
        "project:embedded-safety",
        "Harshit built two patented embedded safety systems between January and December 2024: "
        "a high-altitude autonomous fall-detection system using sensor fusion with automated "
        "actuator deployment, for which a design patent has been granted; and an ESP32 plus "
        "LoRaWAN industrial safety wearable with MQ2 gas, NEO-6M GPS and pulse sensing for "
        "hazardous-environment telemetry, for which a patent has been filed. Stack: ESP32, "
        "LoRaWAN, sensor fusion, embedded C.",
    ),
    (
        "project:nl2sql-bank",
        "Ask the Bank (nl2sql-bank) is Harshit's text-to-SQL system over a real anonymised Czech "
        "bank database of 1,084,180 rows (9 tables and 3 views). Schema linking with BM25, "
        "embeddings and a value index, merged by reciprocal rank fusion, selects the relevant "
        "tables; the LLM writes SQL from five retrieved few-shot examples; a sqlglot syntax-tree "
        "validator allows only a single read-only SELECT and injects a row limit; the query runs "
        "on a read-only SQLite database with a timeout. Failed queries are repaired from the exact "
        "error, at most twice, and every question is audit-logged. It has a 70-question benchmark, "
        "a CLI, a FastAPI service, a Streamlit demo, Docker and CI, and supports Gemini, OpenAI, "
        "Anthropic, Ollama or an offline generator. "
        "GitHub: https://github.com/Harshit-Poddar90/nl2sql-bank",
    ),
    (
        "project:vehicle-trajectories",
        "Constrained Flow Matching for vehicle trajectories is a KTH course project Harshit worked "
        "on. It studies when physical rules should enter the sampling of a generative model. A "
        "conditional Flow Matching model generates "
        "6-second vehicle futures at an Aachen intersection, trained on 14,540 windows of inD "
        "drone data. Without rules 28 percent of futures leave the road. Soft guidance with "
        "lambda 10 reaches 99.9 percent rule-feasible paths without extra jerk, while repeated "
        "hard projection doubles the jerk and a single terminal projection multiplies it by five. "
        "A torus experiment showed the opposite ranking, because equality and inequality "
        "constraints behave differently. Data: the inD dataset by ika, RWTH Aachen University, "
        "distributed by levelXdata (Bock et al., IEEE IV 2020). "
        "GitHub: https://github.com/Harshit-Poddar90/vehicle-trajectory-generation",
    ),
    (
        "project:rhythm-or-tempo",
        "Rhythm or Just Tempo? is a KTH course project Harshit worked on. It tests whether "
        "ballroom-dance classifiers learn the dance style or just the tempo. Random Forest and SVM "
        "models are trained on 698 Ballroom clips in 8 dances, then tested on the same music "
        "time-stretched by up to plus or minus 10 percent with the pitch unchanged, using nested "
        "5-fold cross-validation. Rhythm features fall from 82 percent to 18 percent macro-F1 at "
        "+10 percent tempo, tempo alone from 65 to 13 percent, while timbral features (MFCC, "
        "zero-crossing rate and spectral centroid, implemented from scratch in NumPy) stay near "
        "47 percent. Timbre combined with tempo-free rhythm features holds 66 to 70 percent under "
        "stretching. GitHub: "
        "https://github.com/Harshit-Poddar90/music-informatics-project/tree/from-scratch-timbral",
    ),
    (
        "project:protocol-diagnostics",
        "Harshit is building an AI-driven protocol diagnostic suite: a retrieval-augmented "
        "generation pipeline that interprets LoRaWAN and physical-layer anomalies in raw "
        "telemetry logs, turning unstructured log data into ranked likely causes with the "
        "supporting log lines cited. Stack: LangChain, vector search, MLflow.",
    ),
    # ------------------------------------------------------------------ skills
    (
        "skills:ml",
        "Harshit's machine learning and deep learning skills: PyTorch, state-space models, "
        "transformers, convolutional networks including U-Net, EfficientNet and YOLOv8 and "
        "YOLOv11, explainable AI with Grad-CAM and SHAP, Hugging Face, and Flow Matching.",
    ),
    (
        "skills:llm",
        "Harshit's LLM systems and agent skills: LangGraph, LangChain, retrieval-augmented "
        "generation, tool-calling agents, Gemini APIs, vector search with pgvector and ChromaDB, "
        "and structured-output validation.",
    ),
    (
        "skills:engineering",
        "Harshit's engineering and MLOps skills: Python, Docker, SQL, FastAPI, Streamlit, "
        "PostgreSQL and Supabase, Git, Linux, MLflow, Google Cloud Platform, PyQt5, MATLAB and "
        "LaTeX. Scientific and domain skills: signal processing, Ansys HFSS, DICOM, FHIR and OMOP.",
    ),
    (
        "skills:languages",
        "Harshit speaks English natively, Hindi natively, and Swedish at beginner level (CEFR A1), which he is currently studying.",
    ),
    # --------------------------------------------------------------- education
    (
        "education:kth",
        "Harshit is studying for an M.Sc. in Machine Learning at KTH Royal Institute of "
        "Technology in Stockholm from August 2025 to an expected June 2027. Relevant coursework: "
        "Machine Learning Advanced (DD2434), Deep Learning in Data Science (DD2424), Deep "
        "Learning Advanced Course (DD2610), Deep Generative Models and Synthesis (DD2601), and "
        "Artificial Intelligence and Multi-Agent Systems (DD2438).",
    ),
    (
        "education:kth-ambassador",
        "Since 2026 Harshit has been a KTH International Student Ambassador for the M.Sc. "
        "Machine Learning programme, representing it to prospective international students. "
        "KTH features his student profile on the programme's website: "
        "https://www.kth.se/en/studies/master/machine-learning/students/harshit-1.1485330",
    ),
    (
        "education:vit",
        "Harshit holds a B.Tech in Electronics and Communication Engineering from Vellore "
        "Institute of Technology in India, 2021 to 2025.",
    ),
    # ----------------------------------------------------- research and awards
    (
        "publications",
        "Selected publications by Harshit Poddar: 'LungMate: AI-driven lung cancer diagnosis "
        "with quantitative cancer assessment' with R. Sivakumar, IEEE SENNET 2025, where he is "
        "first author; 'A hyperdimensional framework: RBP and GSN within CNNs for brain tumour "
        "classification' with K. Ramalakshmi, S. Rajagopal and M. B. Kulkarni, Biomedical Signal "
        "Processing and Control (Elsevier) volume 96(B), 2024, where he is fourth author; and "
        "'Analysis of banana plant health using machine learning techniques' by J. D. Thiagarajan "
        "et al., Scientific Reports (Nature) 14:15041, 2024, where he is seventh author. The full "
        "list is on Google Scholar.",
    ),
    (
        "awards",
        "Harshit has one design patent granted and one patent filed for an IoT safety helmet. He "
        "won the Raman Award twice at Vellore Institute of Technology for excellence in research "
        "and innovation. He was a paid LLM evaluation participant for Google DeepMind and Andon "
        "Labs, and is a member of the KTH AI Society and AESIR, the KTH Rocketry team.",
    ),
]


def build_knowledge_base() -> None:
    client = chromadb.PersistentClient(path=DB_PATH)
    embedding_func = GeminiEmbeddingFunction()

    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"Removed existing collection '{COLLECTION_NAME}'.")
    except Exception:
        pass  # first run — nothing to delete

    collection = client.create_collection(
        name=COLLECTION_NAME, embedding_function=embedding_func
    )

    # Most entries fit in one chunk; the splitter only kicks in for the long ones.
    splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=80)

    documents: list[str] = []
    metadatas: list[dict] = []
    ids: list[str] = []

    for section, text in KNOWLEDGE:
        for i, chunk in enumerate(splitter.split_text(text)):
            documents.append(chunk)
            metadatas.append({"section": section})
            ids.append(f"{section}::{i}")

    print(f"Embedding {len(documents)} chunks from {len(KNOWLEDGE)} entries…")
    collection.upsert(documents=documents, metadatas=metadatas, ids=ids)
    print(f"Done. Collection '{COLLECTION_NAME}' holds {collection.count()} chunks at {DB_PATH}.")


if __name__ == "__main__":
    build_knowledge_base()
