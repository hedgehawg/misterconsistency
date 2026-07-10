"""Step 2: test the voice clone before wiring up the full agent.

Usage:
    python clone_test.py voice/me.wav ["Optional custom sentence to speak."]

Writes clone_output.wav in this directory. First run downloads the XTTS-v2
model (~2 GB) to the local HuggingFace cache.
"""

import sys

import torch
from TTS.api import TTS

DEFAULT_TEXT = (
    "Hey, it's me. Well, it's not actually me, it's the clone of me. "
    "If you can't tell the difference, we're in business."
)


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("usage: python clone_test.py <reference.wav> [text]")

    reference_wav = sys.argv[1]
    text = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_TEXT

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading XTTS-v2 on {device} (first run downloads ~2 GB)...")
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

    tts.tts_to_file(
        text=text,
        speaker_wav=reference_wav,
        language="en",
        file_path="clone_output.wav",
    )
    print("Wrote clone_output.wav — have a listen.")


if __name__ == "__main__":
    main()
