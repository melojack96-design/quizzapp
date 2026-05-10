/**
 * sound-manager.js — Professional sound system with no overlap
 * Each event has its own unique sound, managed through a pool system
 */
"use strict";

const SoundManager = (() => {
  let muted = false;
  let volume = 0.7;
  const audioPool = {};
  const MAX_POOL_SIZE = 3;

  const SOUNDS = {
    correct: 'sounds/correct.wav',
    wrong: 'sounds/wrong.wav',
    win: 'sounds/win.wav',
    lose: 'sounds/lose.wav',
    tick: 'sounds/tick.wav',
    coin: 'sounds/coin.wav',
    levelUp: 'sounds/level-up.wav',
    purchase: 'sounds/purchase.wav',
    gameOver: 'sounds/game-over.wav',
    hover: 'sounds/hover.wav',
    click: 'sounds/click.wav',
    spin: 'sounds/spin.wav',
    achievement: 'sounds/achievement.wav',
  };

  function getAudio(name) {
    if (!audioPool[name]) {
      audioPool[name] = [];
      const src = SOUNDS[name];
      if (!src) return null;
      for (let i = 0; i < MAX_POOL_SIZE; i++) {
        const audio = new Audio(src);
        audio.volume = volume;
        audioPool[name].push(audio);
      }
    }
    // Find an available audio instance (not currently playing)
    const pool = audioPool[name];
    for (const audio of pool) {
      if (audio.paused || audio.ended) {
        return audio;
      }
    }
    // All busy, reset first one
    const audio = pool[0];
    audio.currentTime = 0;
    return audio;
  }

  function play(name) {
    if (muted) return;
    const audio = getAudio(name);
    if (!audio) return;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    Object.values(audioPool).forEach(pool => {
      pool.forEach(audio => { audio.volume = volume; });
    });
  }

  function toggleMute() {
    muted = !muted;
    return muted;
  }

  function isMuted() { return muted; }

  // Attach hover sounds to buttons
  function initHoverSounds() {
    document.addEventListener('mouseenter', (e) => {
      if (e.target && e.target.matches && e.target.matches('button, .game-card-btn, .nav-item, .shop-item')) {
        play('hover');
      }
    }, true);

    document.addEventListener('click', (e) => {
      if (e.target && e.target.matches && e.target.matches('button, .game-card-btn, .nav-item')) {
        play('click');
      }
    }, true);
  }

  return {
    play,
    setVolume,
    toggleMute,
    isMuted,
    initHoverSounds,
    SOUNDS,
  };
})();

window.SoundManager = SoundManager;
