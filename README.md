# harshit-poddar90.github.io

Portfolio of **Harshit Poddar**, AI engineer and M.Sc. Machine Learning student at KTH Stockholm.

Live: <https://harshit-poddar90.github.io/>

Plain HTML, CSS and JavaScript (no build step), plus a small chatbot API (FastAPI + Chroma + Gemini) that answers questions about the CV.

## Run locally

```bash
python serve.py
```

Opens the site in your browser. Use this, not double-clicking `index.html`.

## Deploy

- **Site:** push to `main` (GitHub Pages).
- **Chatbot API:** Render runs `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `GOOGLE_API_KEY` in the Render dashboard, never in the repo.

## Licence

MIT
