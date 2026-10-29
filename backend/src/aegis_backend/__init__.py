"""Aegis ingest backend."""


def main() -> None:
    """Console-script entrypoint: `aegis-backend` runs the API server."""

    import uvicorn

    uvicorn.run("aegis_backend.main:app", host="127.0.0.1", port=8000)

