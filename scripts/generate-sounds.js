/**
 * generate-sounds.js — Generate unique WAV sound effects for the gaming platform
 * Each event gets its own distinctive sound using Web Audio API-compatible PCM data
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

function createWavBuffer(samples) {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  
  // WAV Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE / 8, 28);
  buffer.writeUInt16LE(CHANNELS * BITS_PER_SAMPLE / 8, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  
  for (let i = 0; i < samples.length; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(val * 32767), 44 + i * 2);
  }
  return buffer;
}

function envelope(t, attack, decay, sustain, release, duration) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  return sustain * (1 - (t - (duration - release)) / release);
}

// Win sound - triumphant ascending arpeggio
function generateWin() {
  const duration = 1.2;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    notes.forEach((freq, idx) => {
      const noteStart = idx * 0.15;
      const noteT = t - noteStart;
      if (noteT >= 0 && noteT < 0.8) {
        const env = envelope(noteT, 0.02, 0.1, 0.6, 0.3, 0.8);
        val += Math.sin(2 * Math.PI * freq * noteT) * env * 0.3;
        val += Math.sin(2 * Math.PI * freq * 2 * noteT) * env * 0.1;
      }
    });
    samples[i] = val;
  }
  return createWavBuffer(samples);
}

// Lose sound - descending minor tones
function generateLose() {
  const duration = 1.0;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  const notes = [440, 370, 311, 261]; // A4, F#4, D#4, C4
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    notes.forEach((freq, idx) => {
      const noteStart = idx * 0.2;
      const noteT = t - noteStart;
      if (noteT >= 0 && noteT < 0.5) {
        const env = envelope(noteT, 0.01, 0.15, 0.4, 0.2, 0.5);
        val += Math.sin(2 * Math.PI * freq * noteT) * env * 0.35;
        val += Math.sin(2 * Math.PI * freq * 0.5 * noteT) * env * 0.1;
      }
    });
    samples[i] = val;
  }
  return createWavBuffer(samples);
}

// Correct answer - bright positive chime
function generateCorrect() {
  const duration = 0.5;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.005, 0.05, 0.3, 0.35, duration);
    let val = Math.sin(2 * Math.PI * 880 * t) * 0.3;
    val += Math.sin(2 * Math.PI * 1318.5 * t) * 0.2;
    val += Math.sin(2 * Math.PI * 1760 * t) * 0.1;
    samples[i] = val * env;
  }
  return createWavBuffer(samples);
}

// Wrong answer - low buzzer
function generateWrong() {
  const duration = 0.4;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.01, 0.05, 0.5, 0.2, duration);
    let val = Math.sin(2 * Math.PI * 150 * t) * 0.4;
    val += Math.sin(2 * Math.PI * 180 * t) * 0.3;
    val += (Math.random() * 2 - 1) * 0.05;
    samples[i] = val * env;
  }
  return createWavBuffer(samples);
}

// Coin collect - cheerful sparkle
function generateCoin() {
  const duration = 0.35;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.002, 0.05, 0.2, 0.2, duration);
    const freq = 1500 + 800 * Math.sin(t * 30);
    let val = Math.sin(2 * Math.PI * freq * t) * 0.25;
    val += Math.sin(2 * Math.PI * 2637 * t) * 0.15 * Math.exp(-t * 8);
    samples[i] = val * env;
  }
  return createWavBuffer(samples);
}

// Level unlock - magical ascending sweep
function generateLevelUp() {
  const duration = 0.8;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.01, 0.1, 0.5, 0.3, duration);
    const freq = 400 + 1200 * (t / duration);
    let val = Math.sin(2 * Math.PI * freq * t) * 0.3;
    val += Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.15;
    val += Math.sin(2 * Math.PI * freq * 2 * t) * 0.08;
    samples[i] = val * env;
  }
  return createWavBuffer(samples);
}

// Purchase/buy - cash register ding
function generatePurchase() {
  const duration = 0.6;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    // Bell hit
    val += Math.sin(2 * Math.PI * 2093 * t) * 0.3 * Math.exp(-t * 6);
    val += Math.sin(2 * Math.PI * 3136 * t) * 0.2 * Math.exp(-t * 8);
    // Metallic resonance
    val += Math.sin(2 * Math.PI * 4186 * t) * 0.1 * Math.exp(-t * 10);
    samples[i] = val;
  }
  return createWavBuffer(samples);
}

// Game Over - dramatic low sequence
function generateGameOver() {
  const duration = 1.5;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  const notes = [392, 349.23, 329.63, 261.63, 196]; // G4, F4, E4, C4, G3
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    notes.forEach((freq, idx) => {
      const noteStart = idx * 0.25;
      const noteT = t - noteStart;
      if (noteT >= 0 && noteT < 0.6) {
        const env = envelope(noteT, 0.02, 0.1, 0.4, 0.3, 0.6);
        val += Math.sin(2 * Math.PI * freq * noteT) * env * 0.25;
        val += Math.sin(2 * Math.PI * freq * 0.5 * noteT) * env * 0.1;
      }
    });
    samples[i] = val;
  }
  return createWavBuffer(samples);
}

// Hover - subtle soft pop
function generateHover() {
  const duration = 0.08;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 50);
    samples[i] = Math.sin(2 * Math.PI * 1200 * t) * 0.15 * env;
  }
  return createWavBuffer(samples);
}

// Click - crisp button press
function generateClick() {
  const duration = 0.1;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 35);
    let val = Math.sin(2 * Math.PI * 800 * t) * 0.2;
    val += Math.sin(2 * Math.PI * 1600 * t) * 0.1;
    samples[i] = val * env;
  }
  return createWavBuffer(samples);
}

// Tick - countdown timer
function generateTick() {
  const duration = 0.06;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 60);
    samples[i] = Math.sin(2 * Math.PI * 1000 * t) * 0.2 * env;
  }
  return createWavBuffer(samples);
}

// Spin wheel - rotating clicks
function generateSpin() {
  const duration = 0.3;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const clicks = Math.sin(2 * Math.PI * 20 * t) > 0.8 ? 1 : 0;
    const env = envelope(t, 0.01, 0.05, 0.6, 0.1, duration);
    samples[i] = Math.sin(2 * Math.PI * 600 * t) * 0.2 * clicks * env;
  }
  return createWavBuffer(samples);
}

// Achievement unlock - fanfare
function generateAchievement() {
  const duration = 1.0;
  const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
  const notes = [659.25, 783.99, 987.77, 1174.66]; // E5, G5, B5, D6
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    notes.forEach((freq, idx) => {
      const noteStart = idx * 0.12;
      const noteT = t - noteStart;
      if (noteT >= 0 && noteT < 0.7) {
        const env = envelope(noteT, 0.01, 0.08, 0.5, 0.3, 0.7);
        val += Math.sin(2 * Math.PI * freq * noteT) * env * 0.25;
        val += Math.sin(2 * Math.PI * freq * 2 * noteT) * env * 0.08;
      }
    });
    samples[i] = val;
  }
  return createWavBuffer(samples);
}

// Generate all sounds
const soundsDir = path.join(__dirname, '..', 'sounds');

const sounds = {
  'win.wav': generateWin(),
  'lose.wav': generateLose(),
  'correct.wav': generateCorrect(),
  'wrong.wav': generateWrong(),
  'coin.wav': generateCoin(),
  'level-up.wav': generateLevelUp(),
  'purchase.wav': generatePurchase(),
  'game-over.wav': generateGameOver(),
  'hover.wav': generateHover(),
  'click.wav': generateClick(),
  'tick.wav': generateTick(),
  'spin.wav': generateSpin(),
  'achievement.wav': generateAchievement(),
};

Object.entries(sounds).forEach(([filename, buffer]) => {
  const filepath = path.join(soundsDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated: ${filename} (${buffer.length} bytes)`);
});

console.log('\nAll sounds generated successfully!');
