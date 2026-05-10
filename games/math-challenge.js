/**
 * math-challenge.js — Fast math solving game
 */
"use strict";

const MathGame = (() => {
  let score, streak, timeLeft, timerId, difficulty, gameActive;
  let currentProblem = null;

  const DIFFICULTIES = {
    easy: { ops: ['+', '-'], range: [1, 20], time: 60 },
    medium: { ops: ['+', '-', '*'], range: [1, 50], time: 45 },
    hard: { ops: ['+', '-', '*', '/'], range: [1, 100], time: 30 },
  };

  function init() {
    score = 0;
    streak = 0;
    gameActive = false;
    difficulty = 'easy';
    updateUI();
  }

  function start() {
    const diffSelect = document.getElementById('math-difficulty');
    if (diffSelect) difficulty = diffSelect.value;
    
    score = 0;
    streak = 0;
    gameActive = true;
    timeLeft = DIFFICULTIES[difficulty].time;
    
    generateProblem();
    startTimer();
    updateUI();
    
    const status = document.getElementById('math-status');
    if (status) status.textContent = 'Solve as fast as you can!';
    const startBtn = document.getElementById('math-start-btn');
    if (startBtn) startBtn.textContent = 'Playing...';
    if (startBtn) startBtn.disabled = true;
  }

  function generateProblem() {
    const config = DIFFICULTIES[difficulty];
    const op = config.ops[Math.floor(Math.random() * config.ops.length)];
    let a, b, answer;

    switch (op) {
      case '+':
        a = randInt(config.range[0], config.range[1]);
        b = randInt(config.range[0], config.range[1]);
        answer = a + b;
        break;
      case '-':
        a = randInt(config.range[0], config.range[1]);
        b = randInt(config.range[0], a);
        answer = a - b;
        break;
      case '*':
        a = randInt(2, Math.min(12, config.range[1]));
        b = randInt(2, Math.min(12, config.range[1]));
        answer = a * b;
        break;
      case '/':
        b = randInt(2, 12);
        answer = randInt(2, 12);
        a = b * answer;
        break;
      default:
        a = 1; b = 1; answer = 2;
    }

    currentProblem = { a, b, op, answer };
    displayProblem();
  }

  function displayProblem() {
    const questionEl = document.getElementById('math-question');
    const answersEl = document.getElementById('math-answers');
    if (!questionEl || !answersEl) return;

    const opSymbol = { '+': '+', '-': '-', '*': '×', '/': '÷' }[currentProblem.op];
    questionEl.textContent = `${currentProblem.a} ${opSymbol} ${currentProblem.b} = ?`;

    // Generate choices
    const choices = generateChoices(currentProblem.answer);
    answersEl.innerHTML = '';
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'math-choice-btn glass-subtle';
      btn.textContent = String(choice);
      btn.addEventListener('click', () => handleAnswer(choice));
      answersEl.appendChild(btn);
    });
  }

  function generateChoices(correct) {
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const offset = randInt(-10, 10);
      if (offset !== 0) choices.add(correct + offset);
    }
    return shuffleArr([...choices]);
  }

  function handleAnswer(chosen) {
    if (!gameActive) return;
    
    if (chosen === currentProblem.answer) {
      score++;
      streak++;
      if (window.SoundManager) SoundManager.play('correct');
      // Bonus time for streaks
      if (streak % 5 === 0) {
        timeLeft += 3;
        if (window.Toast) Toast.success(`+3s time bonus! Streak x${streak}`);
      }
    } else {
      streak = 0;
      if (window.SoundManager) SoundManager.play('wrong');
    }

    updateUI();
    generateProblem();
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      timeLeft--;
      updateTimeDisplay();
      if (timeLeft <= 5 && timeLeft > 0 && window.SoundManager) SoundManager.play('tick');
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    gameActive = false;
    if (timerId) clearInterval(timerId);
    
    const status = document.getElementById('math-status');
    if (status) status.textContent = `Game Over! Final Score: ${score}`;
    
    const startBtn = document.getElementById('math-start-btn');
    if (startBtn) { startBtn.textContent = 'Play Again'; startBtn.disabled = false; }
    
    if (window.SoundManager) SoundManager.play('gameOver');
    
    // Save best
    const best = parseInt(localStorage.getItem('GameZone:mathBest') || '0', 10);
    if (score > best) localStorage.setItem('GameZone:mathBest', String(score));
    
    // Rewards
    if (window.addPlayerReward) {
      const xp = score * 20 + streak * 5;
      const coins = score * 5 + 10;
      addPlayerReward(xp, coins);
    }
    if (score >= 10 && window.Rewards) Rewards.addWin();
  }

  function updateUI() {
    const scoreEl = document.getElementById('math-score');
    const streakEl = document.getElementById('math-streak');
    if (scoreEl) scoreEl.textContent = String(score);
    if (streakEl) streakEl.textContent = String(streak);
    updateTimeDisplay();
  }

  function updateTimeDisplay() {
    const timeEl = document.getElementById('math-time');
    if (timeEl) timeEl.textContent = String(Math.max(0, timeLeft));
  }

  function destroy() {
    if (timerId) clearInterval(timerId);
    gameActive = false;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffleArr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setupEvents() {
    const startBtn = document.getElementById('math-start-btn');
    if (startBtn) startBtn.addEventListener('click', start);
  }

  return { init, start, destroy, setupEvents };
})();

window.MathGame = MathGame;
