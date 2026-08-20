/**
 * Instant answers.
 *
 * The RAG backend runs on a free tier that sleeps, so the first question of the
 * day can take most of a minute. These cover the questions recruiters actually
 * ask, answer in 0 ms, and cost nothing. The LLM only handles what is left.
 *
 * Keep the wording here in sync with the CV.
 */
export const FAQ = [
    {
        chip: 'Availability?',
        question: 'What are you available for and when?',
        keywords: ['available', 'availability', 'thesis', 'hiring', 'looking', 'open', 'start', 'when', 'notice'],
        answer:
            'Two things: a 30 ECTS master thesis for Jan–Jun 2027 (agreements can be executed through KTH), ' +
            'and full-time roles from mid-2027 after the M.Sc. finishes. Based in Stockholm and open to relocation. ' +
            'Right now I work part-time as an AI Engineer at Massive Dynamic Sweden AB.',
    },
    {
        chip: 'Agentic AI experience',
        question: 'What agentic AI work have you done?',
        keywords: ['agent', 'agentic', 'langgraph', 'orchestration', 'tool-calling', 'tool calling', 'workflow', 'patchpilot'],
        answer:
            'Two main things. At Massive Dynamic I am building the AI orchestration layer for O-LISTIC, a cybersecurity-policy ' +
            'platform — converting a manual pipeline into an end-to-end agentic workflow, 1 of 6 policy-generation stages migrated ' +
            'to tool-calling agents so far, each behind a typed FastAPI endpoint with output validation, retry and fallback routing, ' +
            'and run tracing. Separately, PatchPilot is a LangGraph state machine that intercepts a Python traceback and either ' +
            'returns a verified past fix from pgvector semantic memory (similarity > 0.90) or asks Gemini 2.5 Flash for a patch, ' +
            'with a human-in-the-loop gate before any file write.',
    },
    {
        chip: 'Karolinska project',
        question: 'What are you doing at Karolinska Institutet?',
        keywords: ['karolinska', 'eye', 'state-space', 'state space', 'ssm', 'diffusion', 'generative', 'synthetic', 'time series'],
        answer:
            'I generate synthetic fixational eye-movement sequences by simulation — 5,000+ labelled sequences, far more than lab ' +
            'measurement supplies — and own the whole simulation-to-training pipeline: parameter sweeps, labelling, versioning, ' +
            'reproducible configs. The time series are then modelled with a state-space architecture in PyTorch, benchmarked ' +
            'against diffusion, DiffWave and GAN baselines on distributional agreement with recorded data. Further details are confidential.',
    },
    {
        chip: 'Computer vision work',
        question: 'What computer vision experience do you have?',
        keywords: ['vision', 'cv', 'image', 'segmentation', 'detection', 'yolo', 'unet', 'u-net', 'lungmate', 'medical', 'cancer', 'monuseg'],
        answer:
            'LungMate is the headline one: a hybrid detector replacing the YOLOv11s backbone with EfficientNet-B3 + Swin Transformer ' +
            '+ CBAM, trained on 6,789 annotated CT scans across four lung-cancer classes — 91.05% mAP@0.5, 90.12% precision, ' +
            '2.35 ms inference — shipped as a PyQt5 tool that derives tumour size and mass from 2D boxes. Before that, at Tata ' +
            'Memorial Hospital I benchmarked U-Net against YOLOv8-L on MoNuSeg: U-Net hit 0.82 recall / 0.63 IoU, YOLOv8-L ran ' +
            '~24% faster (61 ms vs 80 ms), with Grad-CAM and SHAP for clinician review.',
    },
    {
        chip: 'Tech stack',
        question: 'What is your tech stack?',
        keywords: ['stack', 'tools', 'technologies', 'skills', 'languages', 'framework', 'know', 'use'],
        answer:
            'ML: PyTorch, state-space models, transformers, U-Net / EfficientNet / YOLOv8–v11, Grad-CAM and SHAP, Hugging Face, Flow Matching. ' +
            'LLM systems: LangGraph, LangChain, RAG, tool-calling agents, Gemini APIs, pgvector and ChromaDB, structured-output validation. ' +
            'Engineering: Python, FastAPI, Docker, SQL, PostgreSQL/Supabase, Streamlit, MLflow, GCP, Git, Linux. ' +
            'Domain: signal processing, Ansys HFSS, DICOM, FHIR, OMOP.',
    },
    {
        chip: 'Education',
        question: 'Where did you study?',
        keywords: ['education', 'study', 'degree', 'university', 'kth', 'vit', 'master', 'msc', 'bachelor', 'course', 'gpa', 'cgpa'],
        answer:
            'M.Sc. Machine Learning at KTH Royal Institute of Technology, Stockholm (Aug 2025 – Jun 2027). Coursework includes ' +
            'Advanced ML (DD2434), Deep Learning in Data Science (DD2424), Advanced Deep Learning (DD2610), Deep Generative Models ' +
            '(DD2601) and AI & Multi-Agent Systems (DD2438). Before that, a B.Tech. in Electronics & Communication Engineering ' +
            'from Vellore Institute of Technology, India (2021–2025).',
    },
    {
        chip: 'Publications & patents',
        question: 'What have you published?',
        keywords: ['publication', 'paper', 'research', 'patent', 'journal', 'ieee', 'scholar', 'award', 'published'],
        answer:
            'Selected publications: "LungMate: AI-driven lung cancer diagnosis with quantitative cancer assessment" (IEEE SENNET 2025, ' +
            '1st author); "A hyperdimensional framework: RBP and GSN within CNNs for brain tumour classification" (Elsevier BSPC 96(B), ' +
            '2024, 4th author); "Analysis of banana plant health using machine learning techniques" (Nature Scientific Reports 14:15041, ' +
            '2024, 7th author). Full list is on Google Scholar. Patents: one filed (IoT safety helmet) and one design patent ' +
            'granted (high-altitude fall protection). Awards: Raman Award ×2 at VIT.',
    },
    {
        chip: 'How to reach him',
        question: 'How do I contact you?',
        keywords: ['contact', 'email', 'reach', 'phone', 'linkedin', 'hire', 'talk', 'call', 'message'],
        answer:
            'Email harshit10233@gmail.com — that is the fastest route. LinkedIn and GitHub are linked in the contact section ' +
            'below, and the form on this page goes straight to the same inbox. Replies usually come within a day.',
    },
];

/**
 * Score a free-text question against the FAQ.
 * Returns the best entry only when the match is confident enough to be useful;
 * anything weaker is handed to the LLM instead.
 */
export function matchFAQ(question) {
    const text = question.toLowerCase();
    let best = null;
    let bestScore = 0;

    for (const entry of FAQ) {
        const score = entry.keywords.reduce((n, kw) => (text.includes(kw) ? n + kw.length : n), 0);
        if (score > bestScore) {
            bestScore = score;
            best = entry;
        }
    }

    // Roughly "two solid keyword hits". Tune upward if you see false positives.
    return bestScore >= 12 ? best : null;
}
