import io
import os
import tempfile
import threading
from typing import Any, Dict, Optional


class ChatterboxModelManager:
    def __init__(self) -> None:
        self._model = None
        self._model_kind = os.getenv("CHATTERBOX_MODEL", "turbo").lower()
        self._device = os.getenv("CHATTERBOX_DEVICE", "cuda")
        self._lock = threading.Lock()

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def _load_model(self):
        if self._model is not None:
            return self._model

        with self._lock:
            if self._model is not None:
                return self._model

            if self._model_kind == "standard":
                from chatterbox.tts import ChatterboxTTS

                self._model = ChatterboxTTS.from_pretrained(device=self._device)
            else:
                from chatterbox.tts_turbo import ChatterboxTurboTTS

                self._model = ChatterboxTurboTTS.from_pretrained(device=self._device)

        return self._model

    def synthesize_wav(
        self,
        text: str,
        audio_prompt_path: Optional[str],
        settings: Optional[Dict[str, Any]] = None,
    ) -> bytes:
        model = self._load_model()
        settings = settings or {}

        generate_kwargs = {}
        if audio_prompt_path:
            generate_kwargs["audio_prompt_path"] = audio_prompt_path
        if "exaggeration" in settings:
            generate_kwargs["exaggeration"] = float(settings["exaggeration"])
        if "cfg_weight" in settings:
            generate_kwargs["cfg_weight"] = float(settings["cfg_weight"])
        if "cfgWeight" in settings:
            generate_kwargs["cfg_weight"] = float(settings["cfgWeight"])

        wav = model.generate(text, **generate_kwargs)
        sample_rate = int(getattr(model, "sr", 24000))

        try:
            import torchaudio as ta

            output = io.BytesIO()
            ta.save(output, wav, sample_rate, format="wav")
            return output.getvalue()
        except Exception:
            import soundfile as sf

            output = io.BytesIO()
            audio = wav.detach().cpu().numpy()
            if audio.ndim == 2 and audio.shape[0] == 1:
                audio = audio[0]
            sf.write(output, audio, sample_rate, format="WAV")
            return output.getvalue()


model_manager = ChatterboxModelManager()
