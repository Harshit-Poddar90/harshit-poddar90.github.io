# harshit-poddar90.github.io

Personal portfolio for **Harshit Poddar** — AI engineer, M.Sc. Machine Learning at KTH Stockholm.

Live: <https://harshit-poddar90.github.io/>

---

## What is in here

Two independent pieces that happen to share a repo.

### 1. The site (static, GitHub Pages)

No build step, no npm, no framework. Plain HTML/CSS/ES modules.

```
index.html         markup + metadata + JSON-LD
style.css          design tokens and all component styles
js/
  main.js          entry point; starts every module exactly once
  config.js        API URL, timings, shared DOM/throttle helpers
  theme.js         dark/light, persisted to localStorage
  boot.js          particle intro (once per session, skippable)
  cursor.js        custom cursor + trail (fine pointers only)
  scenes.js        two Three.js scenes, paused when off-screen
  motion.js        GSAP scroll reveals, counters, tilt, typewriter
  nav.js           mobile menu, active section, scroll chrome
  contact.js       Formspree submission
  translate.js     language picker proxied onto Google's hidden combo box
  faq.js           instant local answers (edit this when the CV changes)
  assistant.js     agent widget: local answers first, RAG as fallback, live trace
  companion.js     the character's expression, blinking, gaze and waving
  bubble.js        its speech: one rate limit, one mute switch, greeting + nudges
  notice.js        comments on whatever the cursor is nearest (pointer devices)
assets/            hand-drawn SVG diagrams, one per project
tools/
  make_og_image.py regenerates og-cover.png
og-cover.png       1200x630 link-preview card
CV.pdf             served directly from the site
```

The agent sprite is a single `<symbol>` in `index.html`; `data-state`
(`idle` / `thinking` / `speaking` / `offline`) drives its expression, and
`js/assistant.js` sets it from what the system is genuinely doing.

### 2. The RAG chatbot API (FastAPI, deployed on Render)

```
embeddings.py      the shared Gemini embedding function
build_db.py        the knowledge base + index builder
query_db.py        retrieval debugging CLI
main.py            the /chat endpoint
portfolio_db/      committed Chroma index
```

---

## Running it

### Site

ES modules are blocked over `file://`, so open it through a server rather
than double-clicking `index.html`:

```bash
python serve.py
```

That is the whole thing — it picks a free port, opens your browser on it, and
serves current code. Pass a port to start looking from a different one:
`python serve.py 8080`.

Use `serve.py`, not `python -m http.server`. The stdlib server lets the browser
cache `style.css` and the ES modules for the whole session, so an edit lands on
disk, the server serves the new bytes, and the page keeps painting the old ones
— indistinguishable from "my change did nothing". `serve.py` sends `no-store`,
steps over a forgotten server from an earlier session instead of failing on
"address already in use", and cache-busts the first document load. A plain
reload is always enough; you never need Ctrl+Shift+R.

### API

```bash
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then add your GOOGLE_API_KEY
uvicorn main:app --reload
```

Check it came up cleanly:

```bash
curl http://127.0.0.1:8000/health
```

`ready: false` means the key or the index is missing — `error` says which.

### When the chatbot stops answering

Nine times out of ten it is not your API key — Google retires Gemini model ids
and the call starts returning `404 NOT_FOUND`. The error names the replacement.
Set `CHAT_MODEL` in the Render dashboard to that id and restart; no code change,
no redeploy.

### Regenerating the link-preview card

```bash
python tools/make_og_image.py
```

### Rebuilding the index

Run this after any CV change, then commit `portfolio_db/`:

```bash
python build_db.py
```

Sanity-check retrieval before blaming the model:

```bash
python query_db.py "What did Harshit do at Karolinska?"
```

---

## Keeping content in sync

The same facts live in three places. When the CV changes, update all three:

| File | Holds |
|---|---|
| `index.html` | what visitors read |
| `js/faq.js` | instant chat answers (no API call) |
| `build_db.py` | what the LLM retrieves — **re-run `build_db.py` after editing** |

---

## Deployment

- **Site** — push to `main`; GitHub Pages serves the repo root.
- **API** — Render web service. Build `pip install -r requirements.txt`,
  start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `GOOGLE_API_KEY`
  and `ALLOWED_ORIGINS` in the Render dashboard, never in the repo.

The free tier sleeps after inactivity, so the first request can take ~50s.
The frontend works around this by warming the dyno when a visitor hovers the
chat button, and by answering common questions locally with zero latency.

---

## Licence

MIT — see [LICENSE](LICENSE).
