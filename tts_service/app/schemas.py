from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1200)
    voice_id: str = "sarah-google"
    format: str = "wav"
    settings: Dict[str, Any] = Field(default_factory=dict)


class VoiceCloneRequest(BaseModel):
    voice_id: str = Field(..., min_length=2, max_length=80)
    display_name: str = Field(..., min_length=2, max_length=120)
    persona: Optional[str] = None


class VoiceInfo(BaseModel):
    id: str
    display_name: str
    persona: str
    reference_audio_path: Optional[str] = None
    settings: Dict[str, Any] = Field(default_factory=dict)
