import json
import os
from pathlib import Path
from typing import Dict, Optional

from .schemas import VoiceInfo


ROOT = Path(__file__).resolve().parents[1]
VOICE_DIR = Path(os.getenv("CHATTERBOX_VOICE_DIR", ROOT / "voices"))
VOICE_DIR.mkdir(parents=True, exist_ok=True)

REGISTRY_PATH = VOICE_DIR / "voices.json"

DEFAULT_VOICES: Dict[str, VoiceInfo] = {
    "sarah-google": VoiceInfo(
        id="sarah-google",
        display_name="Sarah Chen",
        persona="google",
        settings={"exaggeration": 0.45, "cfg_weight": 0.45},
    ),
    "james-amazon": VoiceInfo(
        id="james-amazon",
        display_name="James Rodriguez",
        persona="amazon",
        settings={"exaggeration": 0.5, "cfg_weight": 0.4},
    ),
    "priya-microsoft": VoiceInfo(
        id="priya-microsoft",
        display_name="Priya Sharma",
        persona="microsoft",
        settings={"exaggeration": 0.4, "cfg_weight": 0.5},
    ),
    "alex-meta": VoiceInfo(
        id="alex-meta",
        display_name="Alex Kim",
        persona="meta",
        settings={"exaggeration": 0.58, "cfg_weight": 0.35},
    ),
    "dev-startup": VoiceInfo(
        id="dev-startup",
        display_name="Dev Patel",
        persona="startup",
        settings={"exaggeration": 0.5, "cfg_weight": 0.45},
    ),
}


class VoiceRegistry:
    def __init__(self) -> None:
        self._voices = dict(DEFAULT_VOICES)
        self._load_custom_voices()

    def _load_custom_voices(self) -> None:
        if not REGISTRY_PATH.exists():
            return

        try:
            payload = json.loads(REGISTRY_PATH.read_text())
            for item in payload.get("voices", []):
                voice = VoiceInfo(**item)
                self._voices[voice.id] = voice
        except Exception as exc:
            print(f"Failed to load custom voice registry: {exc}")

    def _save_custom_voices(self) -> None:
        custom = [
            voice.model_dump()
            for voice_id, voice in self._voices.items()
            if voice_id not in DEFAULT_VOICES
        ]
        REGISTRY_PATH.write_text(json.dumps({"voices": custom}, indent=2))

    def list(self):
        return list(self._voices.values())

    def get(self, voice_id: str) -> VoiceInfo:
        return self._voices.get(voice_id) or self._voices["sarah-google"]

    def add_cloned_voice(
        self,
        voice_id: str,
        display_name: str,
        persona: Optional[str],
        reference_audio_path: str,
    ) -> VoiceInfo:
        voice = VoiceInfo(
            id=voice_id,
            display_name=display_name,
            persona=persona or "custom",
            reference_audio_path=reference_audio_path,
            settings={"exaggeration": 0.5, "cfg_weight": 0.45},
        )
        self._voices[voice.id] = voice
        self._save_custom_voices()
        return voice


voice_registry = VoiceRegistry()
