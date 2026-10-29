# Aegis ingest backend

FastAPI service that receives raw scanner exports from the web app, parses and
sanitises them, drafts an executive report with a **local** Ollama model, and
writes the results back to the Supabase `reports` row.

## Stack

- Python 3.12 + [uv](https://docs.astral.sh/uv/)
- FastAPI + uvicorn
- `supabase-py` (service-role writes only)
- Ollama (`llama3.2:3b`) for AI drafting — nothing is sent to any cloud API

## Setup

```bash
# 1. Install a local model (one time)
ollama pull llama3.2:3b

# 2. Configure
cp .env.example .env   # then fill in SUPABASE_URL + SUPABASE_SECRET_KEY
                       # and set INTERNAL_TOKEN to the same value as
                       # BACKEND_INTERNAL_TOKEN in ../web/.env.local

# 3. Run (from this directory)
uv sync
uv run uvicorn aegis_backend.main:app --host 127.0.0.1 --port 8000
# or: uv run aegis-backend
```

## API

| Endpoint         | Method | Description                                             |
| ---------------- | ------ | ------------------------------------------------------- |
| `/healthz`       | GET    | Liveness + configuration status                         |
| `/api/v1/ingest` | POST   | multipart `file` + `report_id`, `Authorization: Bearer` |

The ingest pipeline: parse (`.nessus` / `.nmap` / `.xml` / `.json`) → sanitise
(IPs, hostnames, MACs, credentials, emails are all redacted) → store findings
→ draft AI report → mark the row `ready` (or `failed` with an error).

## Privacy guarantees

- Raw scan files are **never persisted** — only sanitised findings are stored.
- The Ollama prompt contains sanitised titles/severities/counts only.
- The service listens on `127.0.0.1` by default and has no public docs routes.

## Deploy

- **Vercel (current):** `backend/` is its own Vercel project (`aegis-backend`,
  FastAPI preset via `vercel.json`, entrypoint `index.py`). Set `SUPABASE_URL`,
  `SUPABASE_SECRET_KEY` and `INTERNAL_TOKEN` in the project, then
  `vercel deploy --prod` from this directory. Point the web app's `BACKEND_URL`
  at the production domain.
- **Render / any Docker host:** `render.yaml` + `Dockerfile` are included.

Hosted deployments refuse uploads when `INTERNAL_TOKEN` is unset. Without a
reachable Ollama server, reports are written by the built-in rules engine.
