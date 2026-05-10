/**
 * runner.js — Platform Runner (endless side-scroller)
 */
"use strict";

const RunnerGame = (() => {
  let canvas, ctx;
  let player, obstacles, coins, platforms;
  let score, coinCount, bestScore, gameState, frameId, speed;
  const GROUND_Y = 240;
  const PLAYER_SIZE = 30;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;

  function init() {
    canvas = document.getElementById('runner-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    bestScore = parseInt(localStorage.getItem('GameZone:runnerBest') || '0', 10);
    updateBestDisplay();
    reset();
  }

  function reset() {
    player = { x: 80, y: GROUND_Y - PLAYER_SIZE, vy: 0, jumping: false, doubleJump: false };
    obstacles = [];
    coins = [];
    platforms = [];
    score = 0;
    coinCount = 0;
    speed = 4;
    gameState = 'idle';
    hideGameOver();
    draw();
  }

  function start() {
    if (gameState === 'playing') return;
    reset();
    gameState = 'playing';
    loop();
    const status = document.getElementById('runner-status');
    if (status) status.textContent = 'Running! Press Space to jump';
  }

  function jump() {
    if (gameState === 'dead') return;
    if (gameState === 'idle') { start(); return; }
    if (!player.jumping) {
      player.vy = JUMP_FORCE;
      player.jumping = true;
      if (window.SoundManager) SoundManager.play('click');
    } else if (!player.doubleJump) {
      player.vy = JUMP_FORCE * 0.8;
      player.doubleJump = true;
    }
  }

  function update() {
    if (gameState !== 'playing') return;
    
    score++;
    speed = 4 + Math.floor(score / 300) * 0.5;
    
    // Player physics
    player.vy += GRAVITY;
    player.y += player.vy;
    if (player.y >= GROUND_Y - PLAYER_SIZE) {
      player.y = GROUND_Y - PLAYER_SIZE;
      player.vy = 0;
      player.jumping = false;
      player.doubleJump = false;
    }

    // Check platform landing
    platforms.forEach(p => {
      if (player.vy > 0 && player.y + PLAYER_SIZE >= p.y && player.y + PLAYER_SIZE <= p.y + 10 &&
          player.x + PLAYER_SIZE > p.x && player.x < p.x + p.w) {
        player.y = p.y - PLAYER_SIZE;
        player.vy = 0;
        player.jumping = false;
        player.doubleJump = false;
      }
    });

    // Spawn obstacles
    if (Math.random() < 0.015) {
      const h = 20 + Math.random() * 30;
      obstacles.push({ x: canvas.width, y: GROUND_Y - h, w: 20 + Math.random() * 15, h });
    }

    // Spawn coins
    if (Math.random() < 0.02) {
      const cy = GROUND_Y - 50 - Math.random() * 80;
      coins.push({ x: canvas.width, y: cy, collected: false });
    }

    // Spawn platforms
    if (Math.random() < 0.008) {
      const py = GROUND_Y - 70 - Math.random() * 60;
      platforms.push({ x: canvas.width, y: py, w: 60 + Math.random() * 40 });
    }

    // Move elements
    obstacles.forEach(o => { o.x -= speed; });
    coins.forEach(c => { c.x -= speed; });
    platforms.forEach(p => { p.x -= speed; });

    // Cleanup
    obstacles = obstacles.filter(o => o.x > -50);
    coins = coins.filter(c => c.x > -20);
    platforms = platforms.filter(p => p.x > -100);

    // Collect coins
    coins.forEach(c => {
      if (!c.collected && Math.abs(player.x - c.x) < 25 && Math.abs(player.y - c.y) < 25) {
        c.collected = true;
        coinCount++;
        if (window.SoundManager) SoundManager.play('coin');
      }
    });

    // Collision with obstacles
    for (const o of obstacles) {
      if (player.x + PLAYER_SIZE - 5 > o.x && player.x + 5 < o.x + o.w &&
          player.y + PLAYER_SIZE > o.y) {
        die();
        return;
      }
    }

    updateScoreDisplay();
  }

  function die() {
    gameState = 'dead';
    if (frameId) cancelAnimationFrame(frameId);
    const finalScore = Math.floor(score / 10);
    if (finalScore > bestScore) {
      bestScore = finalScore;
      localStorage.setItem('GameZone:runnerBest', String(bestScore));
      updateBestDisplay();
    }
    showGameOver();
    if (window.SoundManager) SoundManager.play('gameOver');
    
    if (window.addPlayerReward) {
      const xp = finalScore * 5 + coinCount * 10;
      const c = coinCount * 2 + Math.floor(finalScore / 5);
      addPlayerReward(xp, c);
    }
    if (finalScore >= 50 && window.Rewards) Rewards.addWin();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0a1228');
    skyGrad.addColorStop(0.7, '#16102e');
    skyGrad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#1a2744';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    ctx.strokeStyle = '#4aa8ff44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();

    // Platforms
    platforms.forEach(p => {
      ctx.fillStyle = '#a16bff88';
      ctx.fillRect(p.x, p.y, p.w, 8);
      ctx.fillStyle = '#a16bff44';
      ctx.fillRect(p.x, p.y + 8, p.w, 4);
    });

    // Obstacles
    obstacles.forEach(o => {
      const grad = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      grad.addColorStop(0, '#ff5c7a');
      grad.addColorStop(1, '#ff2a5e');
      ctx.fillStyle = grad;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      // Glow
      ctx.shadowColor = '#ff5c7a';
      ctx.shadowBlur = 8;
      ctx.fillRect(o.x, o.y, o.w, 3);
      ctx.shadowBlur = 0;
    });

    // Coins
    coins.forEach(c => {
      if (c.collected) return;
      ctx.fillStyle = '#ffd36a';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f6c945';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player
    ctx.fillStyle = '#46e6ff';
    ctx.shadowColor = '#46e6ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.shadowBlur = 0;
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 18, player.y + 8, 6, 6);
    ctx.fillStyle = '#0a1228';
    ctx.fillRect(player.x + 20, player.y + 10, 3, 3);
  }

  function loop() {
    if (gameState !== 'playing') return;
    update();
    draw();
    frameId = requestAnimationFrame(loop);
  }

  function updateScoreDisplay() {
    const scoreEl = document.getElementById('runner-score');
    const coinsEl = document.getElementById('runner-coins');
    if (scoreEl) scoreEl.textContent = String(Math.floor(score / 10));
    if (coinsEl) coinsEl.textContent = String(coinCount);
  }

  function updateBestDisplay() {
    const el = document.getElementById('runner-best');
    if (el) el.textContent = String(bestScore);
  }

  function showGameOver() {
    const overlay = document.getElementById('runner-gameover');
    if (overlay) overlay.classList.remove('hidden');
    const finalEl = document.getElementById('runner-final-score');
    if (finalEl) finalEl.textContent = String(Math.floor(score / 10));
  }

  function hideGameOver() {
    const overlay = document.getElementById('runner-gameover');
    if (overlay) overlay.classList.add('hidden');
  }

  function setupEvents() {
    const startBtn = document.getElementById('runner-start-btn');
    const replayBtn = document.getElementById('runner-replay-btn');
    if (startBtn) startBtn.addEventListener('click', start);
    if (replayBtn) replayBtn.addEventListener('click', start);
    
    if (canvas) {
      canvas.addEventListener('click', jump);
      canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
    }

    document.addEventListener('keydown', (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && 
          document.getElementById('runner-screen')?.classList.contains('visible')) {
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

window.RunnerGame = RunnerGame;
