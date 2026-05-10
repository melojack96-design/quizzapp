"""Generate short correct/wrong WAV sound effects without external deps.

Run: python3 scripts/make_sounds.py
Outputs sounds/correct.wav and sounds/wrong.wav (16-bit PCM, mono, 44.1 kHz).
"""
import math
import os
import struct
import wave

SAMPLE_RATE = 44100
AMP = 0.35


def envelope(t: float, duration: float, attack: float = 0.01, release: float = 0.1) -> float:
    if t < attack:
        return t / attack
    if t > duration - release:
        return max(0.0, (duration - t) / release)
    return 1.0


def write_wav(path: str, samples):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        frames = b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples)
        w.writeframes(frames)


def tone(freq: float, duration: float, start: float = 0.0):
    """Yield (time, sample) tuples for a sine tone."""
    n = int(duration * SAMPLE_RATE)
    for i in range(n):
        t = i / SAMPLE_RATE
        env = envelope(t, duration)
        yield start + t, math.sin(2 * math.pi * freq * t) * env * AMP


def mix(*streams, total_duration: float):
    total_samples = int(total_duration * SAMPLE_RATE)
    buf = [0.0] * total_samples
    for stream in streams:
        for t, s in stream:
            idx = int(t * SAMPLE_RATE)
            if 0 <= idx < total_samples:
                buf[idx] += s
    peak = max((abs(x) for x in buf), default=1.0)
    if peak > 1.0:
        buf = [x / peak for x in buf]
    return buf


def correct_sound():
    # Cheerful ascending chime: C5 -> E5 -> G5
    notes = [
        (523.25, 0.14, 0.0),   # C5
        (659.25, 0.14, 0.12),  # E5
        (783.99, 0.22, 0.24),  # G5
    ]
    streams = [tone(f, d, start=s) for f, d, s in notes]
    return mix(*streams, total_duration=0.55)


def wrong_sound():
    # Descending buzzer: A3 -> F3
    notes = [
        (220.0, 0.18, 0.0),   # A3
        (174.61, 0.28, 0.14), # F3
    ]
    streams = [tone(f, d, start=s) for f, d, s in notes]
    return mix(*streams, total_duration=0.5)


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "..", "sounds")
    os.makedirs(out_dir, exist_ok=True)
    write_wav(os.path.join(out_dir, "correct.wav"), correct_sound())
    write_wav(os.path.join(out_dir, "wrong.wav"), wrong_sound())
    print("Wrote sounds/correct.wav and sounds/wrong.wav")


if __name__ == "__main__":
    main()
