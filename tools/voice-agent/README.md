# Personal Voice Agent (local, free)

A conversational agent that speaks with **your** voice, running entirely on your
own machine — same spirit as the local image-gen setup, no cloud services, no
subscriptions. Goal: handle mundane spoken tasks the way you would.

## How it works

```
your mic ──> VAD (detects you talking) ──> Whisper STT (speech -> text)
                                                    │
speaker <── cloned-voice TTS (streams audio) <── local LLM (persona: you)
```

Every stage is a free, open-source model running locally:

| Stage | Software | Model |
|-------|----------|-------|
| Speech-to-text | [RealtimeSTT](https://github.com/KoljaB/RealtimeSTT) | faster-whisper |
| Brain | [Ollama](https://ollama.com) | llama3.1 (or any model you like) |
| Voice clone TTS | [RealtimeTTS](https://github.com/KoljaB/RealtimeTTS) | Coqui XTTS-v2 |

XTTS-v2 does **zero-shot cloning**: give it 30–60 seconds of your recorded
voice and it speaks as you, streaming with sub-second latency. No training run
needed to get started.

## Hardware

The image-gen machine is what you want: an NVIDIA GPU with 8 GB+ VRAM runs all
three models simultaneously. CPU-only works but the conversation lag kills the
illusion.

## Step 0 — Record your reference voice

Quality here matters more than anything else in the stack.

- Quiet room, no fan/echo. The mic you'd use for the conversation is fine.
- Record **1–5 minutes** of natural conversational speech (talk like you're on
  the phone — not reading a script in "announcer voice").
- Vary it: a few questions, a laugh, some short replies, a longer explanation.
- Save as WAV, mono, 22050 Hz or higher. Audacity works: Tracks > Mix > Mono,
  then Export as WAV.
- Put the file at `tools/voice-agent/voice/me.wav` (gitignored — your voice
  print stays off GitHub).

## Step 1 — Install

Python 3.10 or 3.11 (XTTS is picky about this). From `tools/voice-agent/`:

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows;  source .venv/bin/activate on Linux/Mac

# GPU torch first (pick the CUDA version matching your driver, e.g. cu121)
pip install torch --index-url https://download.pytorch.org/whl/cu121

pip install -r requirements.txt
```

Then install [Ollama](https://ollama.com/download) and pull a model:

```bash
ollama pull llama3.1
```

## Step 2 — Test the clone

```bash
python clone_test.py voice/me.wav
```

Generates `clone_output.wav` speaking a test sentence in your voice. Iterate
here until it sounds right — usually the fix is a cleaner or more natural
reference recording, not settings. Don't move to Step 3 until you'd be fooled
by it.

## Step 3 — Talk to yourself

```bash
python agent.py
```

Speak; it listens, thinks, and answers in your voice. It streams the LLM output
straight into the TTS engine, so it starts talking before the full reply is
generated. Edit `persona.txt` to teach it your phrasing, verbal habits, and
what it's allowed to handle — this is where "sounds like my voice" becomes
"talks like me."

## Where to go next

- **Higher fidelity voice:** if zero-shot XTTS isn't close enough, fine-tune
  [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) on 2–5 minutes of your
  audio (~30 min on your GPU) — noticeably better prosody match. Also worth
  trying: [Chatterbox](https://github.com/resemble-ai/chatterbox) (MIT
  license, strong zero-shot quality).
- **Phone calls / real tasks:** move the same pipeline into
  [Pipecat](https://github.com/pipecat-ai/pipecat), which handles
  interruptions, turn-taking, and telephony (e.g. a Twilio number) properly.
- **Better ears:** bump Whisper to `small.en` or `medium.en` in `agent.py` if
  it mishears you.

## A note on use

Cloning your own voice is your call. But if the agent will speak to *other
people* (receptionists, customer service, family), be aware that some
jurisdictions require disclosing that a caller is AI-generated, and letting it
impersonate you without disclosure can land in murky territory even when the
task is mundane. A one-line "this is an automated assistant calling on behalf
of Steve" in the persona prompt sidesteps most of it.

XTTS-v2's license (Coqui CPML) is non-commercial — fine for personal use like
this, not for a product.
