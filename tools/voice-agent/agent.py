"""Step 3: full conversational loop in your cloned voice.

    mic -> RealtimeSTT (faster-whisper) -> Ollama -> RealtimeTTS (XTTS clone) -> speaker

Usage:
    python agent.py [--voice voice/me.wav] [--model llama3.1] [--whisper base.en]

Requires Ollama running locally (`ollama serve`, usually started automatically)
with the model pulled. Wear headphones, or use a headset mic: the recorder
stays open while the agent talks, and on open speakers it will hear itself.

Ctrl+C to quit.
"""

import argparse
import json

import requests
from RealtimeSTT import AudioToTextRecorder
from RealtimeTTS import CoquiEngine, TextToAudioStream

OLLAMA_URL = "http://localhost:11434/api/chat"


def ollama_stream(model: str, messages: list[dict]):
    """Yield reply text chunks from Ollama as they are generated."""
    response = requests.post(
        OLLAMA_URL,
        json={"model": model, "messages": messages, "stream": True},
        stream=True,
        timeout=300,
    )
    response.raise_for_status()
    for line in response.iter_lines():
        if not line:
            continue
        data = json.loads(line)
        chunk = data.get("message", {}).get("content", "")
        if chunk:
            yield chunk
        if data.get("done"):
            break


def load_persona() -> str:
    try:
        with open("persona.txt", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        return "You are a helpful assistant. Keep replies short and conversational."


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--voice", default="voice/me.wav", help="reference wav of your voice")
    parser.add_argument("--model", default="llama3.1", help="Ollama model name")
    parser.add_argument("--whisper", default="base.en", help="faster-whisper model size")
    args = parser.parse_args()

    print("Loading voice engine (first run downloads XTTS-v2, ~2 GB)...")
    engine = CoquiEngine(voice=args.voice, language="en")
    tts = TextToAudioStream(engine)

    print(f"Loading ears (faster-whisper {args.whisper})...")
    recorder = AudioToTextRecorder(model=args.whisper, language="en", spinner=False)

    messages = [{"role": "system", "content": load_persona()}]
    print("\nReady. Say something. (Ctrl+C to quit)\n")

    try:
        while True:
            heard = recorder.text()
            if not heard or not heard.strip():
                continue
            print(f"you:   {heard}")

            messages.append({"role": "user", "content": heard})
            reply_parts: list[str] = []

            def spoken_reply():
                for chunk in ollama_stream(args.model, messages):
                    reply_parts.append(chunk)
                    yield chunk

            # Streams LLM output straight into TTS: it starts speaking
            # before the full reply exists.
            tts.feed(spoken_reply())
            tts.play()

            reply = "".join(reply_parts)
            print(f"agent: {reply}\n")
            messages.append({"role": "assistant", "content": reply})
    except KeyboardInterrupt:
        print("\nbye")
    finally:
        recorder.shutdown()
        engine.shutdown()


if __name__ == "__main__":
    main()
