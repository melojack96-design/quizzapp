/**
 * rewards.js — Professional rewards system
 * Daily rewards, Spin wheel, Win streak, Achievements
 */
"use strict";

const Rewards = (() => {
  const LS_DAILY_KEY = "GameZone:dailyReward";
  const LS_STREAK_KEY = "GameZone:winStreak";
  const LS_ACHIEVEMENTS_KEY = "GameZone:achievements";
  const LS_SPIN_KEY = "GameZone:lastSpin";
  const LS_LOGIN_DAYS_KEY = "GameZone:loginDays";

  const DAILY_REWARDS = [
    { day: 1, xp: 50, coins: 20, label: "Day 1" },
    { day: 2, xp: 75, coins: 30, label: "Day 2" },
    { day: 3, xp: 100, coins: 50, label: "Day 3" },
    { day: 4, xp: 150, coins: 75, label: "Day 4" },
    { day: 5, xp: 200, coins: 100, label: "Day 5" },
    { day: 6, xp: 300, coins: 150, label: "Day 6" },
    { day: 7, xp: 500, coins: 300, label: "Day 7 MEGA" },
  ];

  const SPIN_PRIZES = [
    { label: "50 XP", xp: 50, coins: 0, color: "#4aa8ff" },
    { label: "100 Coins", xp: 0, coins: 100, color: "#f6c945" },
    { label: "200 XP", xp: 200, coins: 0, color: "#a16bff" },
    { label: "50 Coins", xp: 0, coins: 50, color: "#46e6ff" },
    { label: "500 XP", xp: 500, coins: 0, color: "#ff6fb5" },
    { label: "300 Coins", xp: 0, coins: 300, color: "#32d296" },
    { label: "1000 XP", xp: 1000, coins: 0, color: "#ffd36a" },
    { label: "500 Coins", xp: 0, coins: 500, color: "#ff5c7a" },
  ];

  const ACHIEVEMENTS = [
    { id: "first_win", name: "First Victory", desc: "Win your first game", icon: "🏆", condition: (s) => s.gamesWon >= 1 },
    { id: "quiz_master", name: "Quiz Master", desc: "Complete 10 quiz stages", icon: "🧠", condition: (s) => s.quizStage >= 10 },
    { id: "rich", name: "Getting Rich", desc: "Earn 1000 coins", icon: "💰", condition: (s) => s.totalCoins >= 1000 },
    { id: "streak_3", name: "On Fire!", desc: "Get a 3-win streak", icon: "🔥", condition: (s) => s.maxStreak >= 3 },
    { id: "streak_7", name: "Unstoppable", desc: "Get a 7-win streak", icon: "⚡", condition: (s) => s.maxStreak >= 7 },
    { id: "level_5", name: "Rising Star", desc: "Reach level 5", icon: "⭐", condition: (s) => s.level >= 5 },
    { id: "level_10", name: "Veteran", desc: "Reach level 10", icon: "🌟", condition: (s) => s.level >= 10 },
    { id: "all_games", name: "Explorer", desc: "Play all available games", icon: "🗺️", condition: (s) => s.gamesPlayed >= 9 },
    { id: "snake_50", name: "Snake Charmer", desc: "Score 50+ in Snake", icon: "🐍", condition: (s) => s.snakeBest >= 50 },
    { id: "memory_pro", name: "Memory Pro", desc: "Complete Memory on Hard", icon: "🧩", condition: (s) => s.memoryHardWin },
    { id: "math_wiz", name: "Math Wizard", desc: "Score 20+ in Math Challenge", icon: "🔢", condition: (s) => s.mathBest >= 20 },
    { id: "daily_7", name: "Dedicated", desc: "Log in 7 days in a row", icon: "📅", condition: (s) => s.loginDays >= 7 },
    { id: "coins_5000", name: "Wealthy", desc: "Accumulate 5000 coins", icon: "👑", condition: (s) => s.totalCoins >= 5000 },
    { id: "xp_10000", name: "XP Hunter", desc: "Earn 10000 total XP", icon: "💎", condition: (s) => s.totalXp >= 10000 },
    { id: "riddle_master", name: "Riddle Master", desc: "Complete 100 riddles", icon: "🎯", condition: (s) => s.riddlesSolved >= 100 },
  ];

  const STREAK_BONUSES = [
    { streak: 3, xp: 100, coins: 50 },
    { streak: 5, xp: 200, coins: 100 },
    { streak: 7, xp: 400, coins: 200 },
    { streak: 10, xp: 800, coins: 500 },
    { streak: 15, xp: 1500, coins: 1000 },
  ];

  let winStreak = 0;
  let maxStreak = 0;
  let loginDays = 0;
  let unlockedAchievements = new Set();
  let stats = {};

  function load() {
    try {
      winStreak = parseInt(localStorage.getItem(LS_STREAK_KEY) || "0", 10);
      const saved = JSON.parse(localStorage.getItem(LS_ACHIEVEMENTS_KEY) || "[]");
      unlockedAchievements = new Set(saved);
      loginDays = parseInt(localStorage.getItem(LS_LOGIN_DAYS_KEY) || "0", 10);
      maxStreak = parseInt(localStorage.getItem("GameZone:maxStreak") || "0", 10);
    } catch (_) {}
  }

  function save() {
    localStorage.setItem(LS_STREAK_KEY, String(winStreak));
    localStorage.setItem(LS_ACHIEVEMENTS_KEY, JSON.stringify([...unlockedAchievements]));
    localStorage.setItem(LS_LOGIN_DAYS_KEY, String(loginDays));
    localStorage.setItem("GameZone:maxStreak", String(maxStreak));
  }

  function getDailyRewardStatus() {
    const today = new Date().toDateString();
    const lastClaim = localStorage.getItem(LS_DAILY_KEY);
    return { canClaim: lastClaim !== today, dayIndex: loginDays % 7 };
  }

  function claimDailyReward() {
    const { canClaim, dayIndex } = getDailyRewardStatus();
    if (!canClaim) return null;
    const reward = DAILY_REWARDS[dayIndex];
    localStorage.setItem(LS_DAILY_KEY, new Date().toDateString());
    loginDays++;
    save();
    return reward;
  }

  function canSpin() {
    const lastSpin = localStorage.getItem(LS_SPIN_KEY);
    const today = new Date().toDateString();
    return lastSpin !== today;
  }

  function spin() {
    if (!canSpin()) return null;
    const idx = Math.floor(Math.random() * SPIN_PRIZES.length);
    localStorage.setItem(LS_SPIN_KEY, new Date().toDateString());
    return { prize: SPIN_PRIZES[idx], index: idx };
  }

  function addWin() {
    winStreak++;
    maxStreak = Math.max(maxStreak, winStreak);
    save();
    const bonus = STREAK_BONUSES.find(b => b.streak === winStreak);
    return bonus || null;
  }

  function resetStreak() {
    winStreak = 0;
    save();
  }

  function getStreak() { return winStreak; }
  function getMaxStreak() { return maxStreak; }

  function getNextStreakBonus() {
    return STREAK_BONUSES.find(b => b.streak > winStreak) || STREAK_BONUSES[STREAK_BONUSES.length - 1];
  }

  function checkAchievements(playerStats) {
    stats = playerStats;
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach(ach => {
      if (!unlockedAchievements.has(ach.id) && ach.condition(stats)) {
        unlockedAchievements.add(ach.id);
        newlyUnlocked.push(ach);
      }
    });
    if (newlyUnlocked.length) save();
    return newlyUnlocked;
  }

  function getAchievements() {
    return ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: unlockedAchievements.has(ach.id),
    }));
  }

  function renderDailyRewards(container) {
    if (!container) return;
    const { canClaim, dayIndex } = getDailyRewardStatus();
    container.innerHTML = '';
    DAILY_REWARDS.forEach((reward, idx) => {
      const div = document.createElement('div');
      div.className = 'daily-reward-item';
      if (idx < dayIndex) div.classList.add('claimed');
      if (idx === dayIndex && canClaim) div.classList.add('available');
      if (idx === dayIndex && !canClaim) div.classList.add('today-claimed');
      div.innerHTML = `
        <span class="reward-day">${reward.label}</span>
        <span class="reward-value">+${reward.coins}&#128176;</span>
        <span class="reward-value">+${reward.xp}XP</span>
        ${idx < dayIndex ? '<span class="claimed-check">&#10003;</span>' : ''}
        ${idx === dayIndex && canClaim ? '<span class="claim-glow"></span>' : ''}
      `;
      container.appendChild(div);
    });
  }

  function renderAchievements(container) {
    if (!container) return;
    container.innerHTML = '';
    getAchievements().forEach(ach => {
      const div = document.createElement('div');
      div.className = `achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`;
      div.innerHTML = `
        <span class="ach-icon">${ach.icon}</span>
        <div class="ach-info">
          <strong>${ach.name}</strong>
          <small>${ach.desc}</small>
        </div>
        ${ach.unlocked ? '<span class="ach-badge">&#10003;</span>' : '<span class="ach-lock">&#128274;</span>'}
      `;
      container.appendChild(div);
    });
  }

  function drawSpinWheel(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    const sliceAngle = (2 * Math.PI) / SPIN_PRIZES.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    SPIN_PRIZES.forEach((prize, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(prize.label, r - 15, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Arrow
    ctx.beginPath();
    ctx.moveTo(cx + r + 5, cy);
    ctx.lineTo(cx + r - 15, cy - 10);
    ctx.lineTo(cx + r - 15, cy + 10);
    ctx.fillStyle = '#ff5c7a';
    ctx.fill();
  }

  load();

  return {
    getDailyRewardStatus,
    claimDailyReward,
    canSpin,
    spin,
    addWin,
    resetStreak,
    getStreak,
    getMaxStreak,
    getNextStreakBonus,
    checkAchievements,
    getAchievements,
    renderDailyRewards,
    renderAchievements,
    drawSpinWheel,
    DAILY_REWARDS,
    SPIN_PRIZES,
    STREAK_BONUSES,
    ACHIEVEMENTS,
  };
})();

window.Rewards = Rewards;
