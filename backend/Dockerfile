# Aegis ingest API — production image (Render, Fly, any Docker host).
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.9.5 /uv /usr/local/bin/uv

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Dependencies first so code changes don't bust the layer cache.
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-dev --no-install-project

COPY src ./src
RUN uv sync --frozen --no-dev

RUN useradd --create-home --uid 10001 aegis
USER aegis

# Render injects $PORT; default to 8000 elsewhere.
EXPOSE 8000
CMD ["sh", "-c", "uvicorn aegis_backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
