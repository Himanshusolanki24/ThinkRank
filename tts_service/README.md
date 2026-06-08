# ThinkRank Chatterbox TTS Service

Dedicated FastAPI service for mock-interview interviewer speech.

## Local Run

```bash
cd tts_service
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8010
```

The Node backend expects `CHATTERBOX_TTS_URL=http://localhost:8010`.

## Endpoints

- `GET /health`
- `GET /voices`
- `POST /tts`
- `POST /tts/stream`
- `POST /voices/clone`

Set `CHATTERBOX_DEVICE=cpu` for local CPU testing, or `cuda` for GPU inference.
