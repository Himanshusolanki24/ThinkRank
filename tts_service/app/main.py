import shutil
import time
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

from .model_manager import model_manager
from .schemas import TTSRequest
from .voice_registry import VOICE_DIR, voice_registry


app = FastAPI(
    title="ThinkRank Chatterbox TTS Service",
    description="Dedicated Chatterbox voice generation service for mock interviews.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "chatterbox-tts",
        "model_loaded": model_manager.is_loaded,
    }


@app.get("/voices")
async def voices():
    return {"voices": [voice.model_dump() for voice in voice_registry.list()]}


def _generate_audio(payload: TTSRequest) -> bytes:
    voice = voice_registry.get(payload.voice_id)
    settings = dict(voice.settings)
    settings.update(payload.settings or {})

    try:
        return model_manager.synthesize_wav(
            text=payload.text.strip(),
            audio_prompt_path=voice.reference_audio_path,
            settings=settings,
        )
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Chatterbox dependencies are not installed: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {exc}") from exc


@app.post("/tts")
async def tts(payload: TTSRequest):
    started_at = time.time()
    audio = _generate_audio(payload)
    return Response(
        content=audio,
        media_type="audio/wav",
        headers={
            "X-TTS-Latency-Ms": str(round((time.time() - started_at) * 1000)),
            "Cache-Control": "no-store",
        },
    )


@app.post("/tts/stream")
async def tts_stream(payload: TTSRequest):
    audio = _generate_audio(payload)

    def chunks():
        chunk_size = 32 * 1024
        for index in range(0, len(audio), chunk_size):
            yield audio[index:index + chunk_size]

    return StreamingResponse(
        chunks(),
        media_type="audio/wav",
        headers={"Cache-Control": "no-store"},
    )


@app.post("/voices/clone")
async def clone_voice(
    voice_id: str = Form(...),
    display_name: str = Form(...),
    persona: str = Form("custom"),
    file: UploadFile = File(...),
):
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="An audio reference file is required.")

    safe_voice_id = "".join(ch for ch in voice_id.lower() if ch.isalnum() or ch in ("-", "_"))
    if not safe_voice_id:
        raise HTTPException(status_code=400, detail="voice_id is invalid.")

    suffix = Path(file.filename or "reference.wav").suffix or ".wav"
    reference_path = VOICE_DIR / f"{safe_voice_id}{suffix}"

    with reference_path.open("wb") as output:
        shutil.copyfileobj(file.file, output)

    voice = voice_registry.add_cloned_voice(
        voice_id=safe_voice_id,
        display_name=display_name,
        persona=persona,
        reference_audio_path=str(reference_path),
    )

    return {"success": True, "voice": voice.model_dump()}
