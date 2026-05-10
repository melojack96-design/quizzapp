/**
 * flappy.js — Flappy Bird game
 */
"use strict";

const FlappyGame = (() => {
  let canvas, ctx;
  let bird, pipes, score, bestScore, gameState, frameId;
  const GRAVITY = 0.4;
  const JUMP = -7;
  const PIPE_SPEED = 2.5;
  const PIPE_GAP = 140;
  const PIPE_WIDTH = 50;
  const BIRD_SIZE = 20;

  function init() {
    canvas = document.getElementById('flappy-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    bestScore = parseInt(localStorage.getItem('GameZone:flappyBest') || '0', 10);
    updateBestDisplay();
    reset();
  }

  function reset() {
    bird = { x: 80, y: 200, vy: 0, rotation: 0 };
    pipes = [];
    score = 0;
    gameState = 'idle';
    updateScoreDisplay();
    hideGameOver();
    draw();
  }

  function start() {
    if (gameState === 'playing') return;
    reset();
    gameState = 'playing';
    bird.vy = JUMP;
    addPipe();
    loop();
    const status = document.getElementById('flappy-status');
    if (status) status.textContent = 'Click or Space to fly!';
  }

  function jump() {
    if (gameState === 'dead') return;
    if (gameState === 'idle') { start(); return; }
    bird.vy = JUMP;
    if (window.SoundManager) SoundManager.play('click');
  }

  function addPipe() {
    const gapY = 80 + Math.random() * (canvas.height - PIPE_GAP - 160);
    pipes.push({
      x: canvas.width,
      gapTop: gapY,
      gapBottom: gapY + PIPE_GAP,
      scored: false,
    });
  }

  function update() {
    if (gameState !== 'playing') return;

    bird.vy += GRAVITY;
    bird.y += bird.vy;
    bird.rotation = Math.min(bird.vy * 3, 40);

    // Add pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
      addPipe();
    }

    // Move pipes
    pipes.forEach(pipe => { pipe.x -= PIPE_SPEED; });
    pipes = pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

    // Score
    pipes.forEach(pipe => {
      if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
        pipe.scored = true;
        score++;
        updateScoreDisplay();
        if (window.SoundManager) SoundManager.play('coin');
      }
    });

    // Collision
    if (bird.y < 0 || bird.y + BIRD_SIZE > canvas.height) { die(); return; }
    for (const pipe of pipes) {
      if (bird.x + BIRD_SIZE > pipe.x && bird.x < pipe.x + PIPE_WIDTH) {
        if (bird.y < pipe.gapTop || bird.y + BIRD_SIZE > pipe.gapBottom) {
          die(); return;
        }
      }
    }
  }

  function die() {
    gameState = 'dead';
    if (frameId) cancelAnimationFrame(frameId);
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('GameZone:flappyBest', String(bestScore));
      updateBestDisplay();
    }
    showGameOver();
    if (window.SoundManager) SoundManager.play('gameOver');
    
    // Rewards
    if (window.addPlayerReward) {
      const xp = score * 15 + 10;
      const coins = score * 3 + 5;
      addPlayerReward(xp, coins);
    }
    if (score >= 5 && window.Rewards) Rewards.addWin();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a1228');
    grad.addColorStop(1, '#16102e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pipes
    pipes.forEach(pipe => {
      const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      gradient.addColorStop(0, '#32d296');
      gradient.addColorStop(1, '#46e6ff');
      ctx.fillStyle = gradient;
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapTop);
      ctx.fillRect(pipe.x - 3, pipe.gapTop - 20, PIPE_WIDTH + 6, 20);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapBottom, PIPE_WIDTH, canvas.height - pipe.gapBottom);
      ctx.fillRect(pipe.x - 3, pipe.gapBottom, PIPE_WIDTH + 6, 20);
    });

    // Bird
    ctx.save();
    ctx.translate(bird.x + BIRD_SIZE / 2, bird.y + BIRD_SIZE / 2);
    ctx.rotate((bird.rotation * Math.PI) / 180);
    ctx.fillStyle = '#ffd36a';
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.moveTo(BIRD_SIZE / 2, -2);
    ctx.lineTo(BIRD_SIZE / 2 + 8, 2);
    ctx.lineTo(BIRD_SIZE / 2, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(3, -3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(4, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Score on canvas
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(score), canvas.width / 2, 40);
  }

  function loop() {
    if (gameState !== 'playing') return;
    update();
    draw();
    frameId = requestAnimationFrame(loop);
  }

  function updateScoreDisplay() {
    const el = document.getElementById('flappy-score');
    if (el) el.textContent = String(score);
  }

  function updateBestDisplay() {
    const el = document.getElementById('flappy-best');
    if (el) el.textContent = String(bestScore);
  }

  function showGameOver() {
    const overlay = document.getElementById('flappy-gameover');
    if (overlay) overlay.classList.remove('hidden');
    const finalScore = document.getElementById('flappy-final-score');
    if (finalScore) finalScore.textContent = String(score);
  }

  function hideGameOver() {
    const overlay = document.getElementById('flappy-gameover');
    if (overlay) overlay.classList.add('hidden');
  }

  function setupEvents() {
    const startBtn = document.getElementById('flappy-start-btn');
    const replayBtn = document.getElementById('flappy-replay-btn');
    if (startBtn) startBtn.addEventListener('click', start);
    if (replayBtn) replayBtn.addEventListener('click', start);
    
    if (canvas) {
      canvas.addEventListener('click', jump);
      canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
    }

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.getElementById('flappy-screen')?.classList.contains('visible')) {
        e.preventDefault();
        jump();
      }
    });
  }

  function destroy() {
    if (frameId) cancelAnimationFrame(frameId);
    gameState = 'idle';
  }

  return { init, start, reset, destroy, setupEvents, jump };
})();

window.FlappyGame = FlappyGame;
