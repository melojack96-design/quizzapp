/**
 * renderer.js — Quiz game logic with Stages system
 * Each stage has (stage * 10) questions, capped at 100.
 * Progress is tracked per-stage and saved to Firestore/localStorage.
 */
"use strict";

const i18n = {
  en: {
    appTitle: "App Quiz", tagline: "Level up your knowledge",
    stage: "Stage", questions: "Questions", health: "Health", home: "Home", back: "Back", time: "Time", timeUp: "Time up!",
    quizGame: "Quiz Game", quizGameDesc: "Play the original 100-stage quiz",
    tictactoeGame: "X and O Tic Tac Toe", tictactoeGameDesc: "Play 1 vs 1 or 1 vs Bot",
    puzzleGame: "Puzzle Game", puzzleGameDesc: "Slide tiles into the correct order",
    snakeGame: "Snake Game", snakeGameDesc: "Eat food, level up, and change skin",
    riddlesGame: "Riddles Game", riddlesGameDesc: "Answer riddles with A B C D choices", riddleCorrect: "Correct!", riddleWrong: "Wrong answer!", riddleTimeUp: "Time up!", riddleComplete: "You finished this riddle level!", riddleLevel: "Riddle Level", levelComplete: "Level complete!", chooseRiddleLevel: "Choose level", matchingGame: "Picture Match", matchingGameDesc: "Find all matching picture pairs", matches: "Matches", newMatchGame: "New Game", matchingReady: "Flip cards and match the pictures.", matchingPick: "Pick another card.", matchingGood: "Nice match!", matchingWrong: "Try again.", matchingComplete: "You matched all pictures!", matchingTimeUp: "Time up! Try again.", difficulty: "Difficulty", xp: "XP", coins: "Coins",
    score: "Score", level: "Level", skin: "Skin", start: "Start", pause: "Pause", resume: "Resume", easy: "Easy", medium: "Medium", hard: "Hard", classic: "Classic", fire: "Fire", ice: "Ice", gold: "Gold", snakeReady: "Choose a level and press Start.", snakeRunning: "Use arrow keys or buttons to move.", snakePaused: "Paused", snakeGameOver: "Game over! Press Start to play again.",
    oneVsOne: "1 vs 1", oneVsBot: "1 vs Bot", resetGame: "Next Round", newPuzzle: "New Puzzle", moves: "Moves",
    chooseMode: "Choose a mode to start.", turn: "Turn", botThinking: "Bot is thinking...", draw: "Draw!", wins: "wins!",
    player1: "User 1", player2: "User 2", bot: "Bot", result: "Result", round: "Round", newMatch: "New Match",
    puzzleReady: "Arrange numbers from 1 to 8.", puzzleSolved: "Puzzle solved!", healthEmpty: "No health left! Stage restarted.",
    welcome: "Welcome to App Quiz",
    welcomeSubtitle: "100 stages \u00B7 English & Arabic \u00B7 Test your knowledge",
    feature1: "Glassmorphism UI", feature2: "Multiple questions per stage",
    feature3: "Instant feedback with sound", play: "Play", progress: "Progress",
    question: "Question", next: "Next", tryAgain: "Try Again", restart: "Restart",
    correct: "Correct!", wrong: "Wrong!", correctAnswerIs: "Correct answer:",
    stageComplete: "Stage Complete!", stageCompleteMsg: "You completed all questions in this stage.",
    nextStage: "Next Stage",
    congrats: "You beat all 100 stages!", congratsSubtitle: "You're a true Quiz master.",
    playAgain: "Play again", noQuestion: "No question available for this stage."
  },
  ar: {
    appTitle: "\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0627\u0633\u0626\u0644\u0629",
    tagline: "\u0627\u0631\u0641\u0639 \u0645\u0633\u062A\u0648\u0649 \u0645\u0639\u0631\u0641\u062A\u0643",
    stage: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629",
    questions: "\u0623\u0633\u0626\u0644\u0629",
    health: "\u0627\u0644\u0635\u062D\u0629", home: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", back: "\u0631\u062C\u0648\u0639", time: "\u0627\u0644\u0648\u0642\u062A", timeUp: "\u0627\u0646\u062A\u0647\u0649 \u0627\u0644\u0648\u0642\u062A!",
    quizGame: "\u0644\u0639\u0628\u0629 \u0627\u0644\u0623\u0633\u0626\u0644\u0629", quizGameDesc: "\u0627\u0644\u0639\u0628 \u0627\u0644\u0643\u0648\u064A\u0632 \u0627\u0644\u0623\u0635\u0644\u064A \u0628\u0640 100 \u0645\u0631\u062D\u0644\u0629",
    tictactoeGame: "X \u0648 O", tictactoeGameDesc: "\u0627\u0644\u0639\u0628 1 \u0636\u062F 1 \u0623\u0648 1 \u0636\u062F \u0627\u0644\u0628\u0648\u062A",
    puzzleGame: "\u0644\u0639\u0628\u0629 \u0627\u0644\u0628\u0627\u0632\u0644", puzzleGameDesc: "\u0631\u062A\u0628 \u0627\u0644\u0645\u0631\u0628\u0639\u0627\u062A \u0628\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0635\u062D\u064A\u062D",
    riddlesGame: "لعبة الألغاز", riddlesGameDesc: "ألغاز مع اختيارات A B C D", riddleCorrect: "إجابة صحيحة!", riddleWrong: "إجابة خاطئة!", riddleTimeUp: "انتهى الوقت!", riddleComplete: "أنهيت هذا المستوى من الألغاز!", riddleLevel: "مستوى الألغاز", levelComplete: "اكتمل المستوى!", chooseRiddleLevel: "اختر المستوى", matchingGame: "\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0635\u0648\u0631", matchingGameDesc: "\u0627\u0628\u062D\u062B \u0639\u0646 \u0623\u0632\u0648\u0627\u062C \u0627\u0644\u0635\u0648\u0631", matches: "\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0627\u062A", newMatchGame: "\u0644\u0639\u0628\u0629 \u062C\u062F\u064A\u062F\u0629", matchingReady: "\u0627\u0642\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u0648\u0637\u0627\u0628\u0642 \u0627\u0644\u0635\u0648\u0631.", matchingPick: "\u0627\u062E\u062A\u0631 \u0628\u0637\u0627\u0642\u0629 \u0623\u062E\u0631\u0649.", matchingGood: "\u0645\u0637\u0627\u0628\u0642\u0629 \u0631\u0627\u0626\u0639\u0629!", matchingWrong: "\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.", matchingComplete: "\u0644\u0642\u062F \u0637\u0627\u0628\u0642\u062A \u0643\u0644 \u0627\u0644\u0635\u0648\u0631!",
    oneVsOne: "1 \u0636\u062F 1", oneVsBot: "1 \u0636\u062F \u0627\u0644\u0628\u0648\u062A", resetGame: "\u0627\u0644\u062C\u0648\u0644\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", newPuzzle: "\u0628\u0627\u0632\u0644 \u062C\u062F\u064A\u062F", moves: "\u0627\u0644\u062D\u0631\u0643\u0627\u062A",
    chooseMode: "\u0627\u062E\u062A\u0631 \u0646\u0645\u0637 \u0627\u0644\u0644\u0639\u0628.", turn: "\u062F\u0648\u0631", botThinking: "\u0627\u0644\u0628\u0648\u062A \u064A\u0641\u0643\u0631...", draw: "\u062A\u0639\u0627\u062F\u0644!", wins: "\u0641\u0627\u0632!",
    player1: "\u0627\u0644\u0644\u0627\u0639\u0628 1", player2: "\u0627\u0644\u0644\u0627\u0639\u0628 2", bot: "\u0627\u0644\u0628\u0648\u062A", result: "\u0627\u0644\u0646\u062A\u064A\u062C\u0629", round: "\u0627\u0644\u062C\u0648\u0644\u0629", newMatch: "\u0645\u0628\u0627\u0631\u0627\u0629 \u062C\u062F\u064A\u062F\u0629",
    puzzleReady: "\u0631\u062A\u0628 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0645\u0646 1 \u0625\u0644\u0649 8.", puzzleSolved: "\u062A\u0645 \u062D\u0644 \u0627\u0644\u0628\u0627\u0632\u0644!", healthEmpty: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u0635\u062D\u0629! \u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u0631\u062D\u0644\u0629.",
    welcome: "\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u0643 \u0641\u064A \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0627\u0633\u0626\u0644\u0629",
    welcomeSubtitle: "\u0661\u0660\u0660 \u0645\u0631\u062D\u0644\u0629 \u00B7 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u00B7 \u0627\u062E\u062A\u0628\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u0643",
    feature1: "\u062A\u0635\u0645\u064A\u0645 \u0632\u062C\u0627\u062C\u064A \u0639\u0635\u0631\u064A",
    feature2: "\u0623\u0633\u0626\u0644\u0629 \u0645\u062A\u0639\u062F\u062F\u0629 \u0644\u0643\u0644 \u0645\u0631\u062D\u0644\u0629",
    feature3: "\u062A\u063A\u0630\u064A\u0629 \u0631\u0627\u062C\u0639\u0629 \u0641\u0648\u0631\u064A\u0629 \u0645\u0639 \u0635\u0648\u062A",
    play: "\u0627\u0628\u062F\u0623 \u0627\u0644\u0644\u0639\u0628",
    progress: "\u0627\u0644\u062A\u0642\u062F\u0645",
    question: "\u0633\u0624\u0627\u0644",
    next: "\u0627\u0644\u062A\u0627\u0644\u064A",
    tryAgain: "\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649",
    restart: "\u0625\u0639\u0627\u062F\u0629",
    correct: "\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629!",
    wrong: "\u0625\u062C\u0627\u0628\u0629 \u062E\u0627\u0637\u0626\u0629!",
    correctAnswerIs: "\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629:",
    stageComplete: "\u0627\u0643\u062A\u0645\u0644\u062A \u0627\u0644\u0645\u0631\u062D\u0644\u0629!",
    stageCompleteMsg: "\u0644\u0642\u062F \u0623\u0643\u0645\u0644\u062A \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629.",
    nextStage: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629",
    congrats: "\u0644\u0642\u062F \u062A\u062E\u0637\u064A\u062A \u0643\u0644 \u0627\u0644\u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u0640 \u0661\u0660\u0660!",
    congratsSubtitle: "\u0623\u0646\u062A \u0628\u0637\u0644 \u0643\u0648\u064A\u0632 \u0627\u0644\u062D\u0642\u064A\u0642\u064A.",
    playAgain: "\u0627\u0644\u0639\u0628 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649",
    noQuestion: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0633\u0624\u0627\u0644 \u0645\u062A\u0627\u062D \u0644\u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629."
  }
};

const state = {
  lang: "en",
  stage: 1,
  maxStages: 100,
  questionIndex: 0,
  totalQuestionsInStage: 10,
  currentQuestion: null,
  answered: false,
  selectedLetter: null,
  answeredQuestionIds: new Set(),
  health: 3,
  maxHealth: 3,
  quizTimeLimit: 30,
  timeLeft: 30,
  timerId: null,
  playerLevel: 0,
  playerXp: 0,
  playerCoins: 0,
  lastHeartLossAt: null,
  heartRegenTimerId: null,
};

const LS_LANG_KEY  = "AppQuiz:lang";
const LS_STATS_KEY = "AppQuiz:stats";
const LS_HEALTH_KEY = "AppQuiz:health";
const HEART_REGEN_MINUTES = [5, 15, 30];
const HEART_STORE = {
  1: Math.floor(300 * 0.8),
  2: Math.floor(1000 * 0.8),
  3: Math.floor(2400 * 0.8)
};

/* ── Elements cache ── */
const el = {};
function cacheEls() {
  el.html          = document.documentElement;
  el.langToggle    = document.getElementById("lang-toggle");
  el.langFlag      = document.getElementById("lang-flag");
  el.langText      = document.getElementById("lang-text");
  el.stageNumber   = document.getElementById("stage-number");
  el.stageMax      = document.getElementById("stage-max");
  el.stageQCount   = document.getElementById("stage-question-count");
  el.healthHearts  = document.getElementById("health-hearts");
  el.heartTimer = document.getElementById("heart-timer");
  el.storeMessage = document.getElementById("store-message");
  el.navLevel = document.getElementById("nav-level");
  el.navXp = document.getElementById("nav-xp");
  el.navXpFill = document.getElementById("nav-xp-fill");
  el.navCoins = document.getElementById("nav-coins");

  el.startScreen   = document.getElementById("start-screen");
  el.quizScreen    = document.getElementById("quiz-screen");
  el.finishScreen  = document.getElementById("finish-screen");
  el.stageComplete = document.getElementById("stage-complete-screen");
  el.tictactoeScreen = document.getElementById("tictactoe-screen");
  el.puzzleScreen = document.getElementById("puzzle-screen");
  el.snakeScreen = document.getElementById("snake-screen");
  el.matchingScreen = document.getElementById("matching-screen");
  el.riddlesScreen = document.getElementById("riddles-screen");

  el.playBtn       = document.getElementById("play-btn");
  el.tictactoeMenuBtn = document.getElementById("tictactoe-menu-btn");
  el.puzzleMenuBtn = document.getElementById("puzzle-menu-btn");
  el.snakeMenuBtn = document.getElementById("snake-menu-btn");
  el.matchingMenuBtn = document.getElementById("matching-menu-btn");
  el.riddlesMenuBtn = document.getElementById("riddles-menu-btn");
  el.playAgainBtn  = document.getElementById("play-again-btn");
  el.nextStageBtn  = document.getElementById("next-stage-btn");

  el.progressFill    = document.getElementById("progress-fill");
  el.progressText    = document.getElementById("progress-text");
  el.questionBlock   = document.getElementById("question-block");
  el.questionNumber  = document.getElementById("question-number");
  el.questionTotal   = document.getElementById("question-total");
  el.questionText    = document.getElementById("question-text");
  el.answers         = document.getElementById("answers");
  el.answerBtns      = [...document.querySelectorAll(".answer-btn")];
  el.feedback        = document.getElementById("feedback");
  el.nextBtn         = document.getElementById("next-btn");
  el.tryAgainBtn     = document.getElementById("try-again-btn");
  el.restartBtn      = document.getElementById("restart-btn");
  el.quizBackBtn     = document.getElementById("quiz-back-btn");
  el.quizTimer       = document.getElementById("quiz-timer");
  el.quizTimeLeft    = document.getElementById("quiz-time-left");

  el.sfxCorrect = document.getElementById("sfx-correct");
  el.sfxWrong   = document.getElementById("sfx-wrong");
  el.sfxWin     = document.getElementById("sfx-win");
  el.sfxLose    = document.getElementById("sfx-lose");
  el.sfxTick    = document.getElementById("sfx-tick");

  el.tttStatus = document.getElementById("ttt-status");
  el.tttScore = document.getElementById("ttt-score");
  el.tttRound = document.getElementById("ttt-round");
  el.tttWinIcon = document.getElementById("ttt-win-icon");
  el.tttCells = [...document.querySelectorAll(".ttt-cell")];
  el.tttPvpBtn = document.getElementById("ttt-pvp-btn");
  el.tttBotBtn = document.getElementById("ttt-bot-btn");
  el.tttResetBtn = document.getElementById("ttt-reset-btn");
  el.tttHomeBtn = document.getElementById("ttt-home-btn");

  el.puzzleStatus = document.getElementById("puzzle-status");
  el.puzzleBoard = document.getElementById("puzzle-board");
  el.puzzleNewBtn = document.getElementById("puzzle-new-btn");
  el.puzzleMoves = document.getElementById("puzzle-moves");
  el.puzzleHomeBtn = document.getElementById("puzzle-home-btn");

  el.snakeStatus = document.getElementById("snake-status");
  el.snakeCanvas = document.getElementById("snake-canvas");
  el.snakeScore = document.getElementById("snake-score");
  el.snakeLevel = document.getElementById("snake-level");
  el.snakeLevelLabel = document.getElementById("snake-level-label");
  el.snakeSkin = document.getElementById("snake-skin");
  el.snakeSkinLabel = document.getElementById("snake-skin-label");
  el.snakeStartBtn = document.getElementById("snake-start-btn");
  el.snakePauseBtn = document.getElementById("snake-pause-btn");
  el.snakeHomeBtn = document.getElementById("snake-home-btn");
  el.snakeMobileBtns = [...document.querySelectorAll(".snake-mobile-controls [data-dir]")];

  el.matchingStatus = document.getElementById("matching-status");
  el.matchingBoard = document.getElementById("matching-board");
  el.matchingMoves = document.getElementById("matching-moves");
  el.matchingScore = document.getElementById("matching-score");
  el.matchingTime = document.getElementById("matching-time");
  el.matchingLevel = document.getElementById("matching-level");
  el.matchingDifficulty = document.getElementById("matching-difficulty");
  el.matchingLevelLabel = document.getElementById("matching-level-label");
  el.matchingDifficultyLabel = document.getElementById("matching-difficulty-label");
  el.matchingNewBtn = document.getElementById("matching-new-btn");
  el.matchingHomeBtn = document.getElementById("matching-home-btn");

  el.riddlesStatus = document.getElementById("riddles-status");
  el.riddlesCount = document.getElementById("riddles-count");
  el.riddlesLevel = document.getElementById("riddles-level");
  el.riddlesLevelLabel = document.getElementById("riddles-level-label");
  el.riddlesTime = document.getElementById("riddles-time");
  el.riddlesScore = document.getElementById("riddles-score");
  el.riddlesCombo = document.getElementById("riddles-combo");
  el.riddleNumber = document.getElementById("riddle-number");
  el.riddleQuestion = document.getElementById("riddle-question");
  el.riddleAnswerBtns = [...document.querySelectorAll("[data-riddle-letter]")];
  el.riddlesFeedback = document.getElementById("riddles-feedback");
  el.riddlesNextBtn = document.getElementById("riddles-next-btn");
  el.riddlesRestartBtn = document.getElementById("riddles-restart-btn");
  el.riddlesHomeBtn = document.getElementById("riddles-home-btn");
}

/* ── i18n ── */
function applyLang() {
  const dict = i18n[state.lang];
  el.html.setAttribute("lang", state.lang);
  el.html.setAttribute("dir", state.lang === "ar" ? "rtl" : "ltr");
  document.querySelectorAll("[data-i18n]").forEach(node => {
    const key = node.getAttribute("data-i18n");
    if (dict[key] !== undefined) node.textContent = dict[key];
  });
  if (state.lang === "ar") {
    el.langFlag.textContent = "AR"; el.langText.textContent = "\u0627\u0644\u0639\u0631\u0628\u064A\u0629";
  } else {
    el.langFlag.textContent = "EN"; el.langText.textContent = "English";
  }
  if (state.currentQuestion) {
    renderQuestionText(); renderAnswerTexts();
    if (state.answered) renderFeedback();
  }
  updatePlayerStatsUI();
  renderMatchingGame();
  setupRiddleLevels();
  if (riddles.current) riddles.current = buildRiddle(riddles.index);
  renderRiddleQuestion();
}

function toggleLang() {
  state.lang = state.lang === "en" ? "ar" : "en";
  localStorage.setItem(LS_LANG_KEY, state.lang);
  applyLang();
}

/* ── Screens ── */
function showScreen(which) {
  if (which !== "quiz") stopQuizTimer();
  if (which !== "snake") stopSnake();
  if (which !== "matching") stopMatchingTimer();
  if (which !== "riddles") stopRiddleTimer();
  [el.startScreen, el.quizScreen, el.finishScreen, el.stageComplete, el.tictactoeScreen, el.puzzleScreen, el.snakeScreen, el.matchingScreen, el.riddlesScreen].forEach(n => {
    if (n) n.classList.remove("visible");
  });
  const map = {
    start: el.startScreen, quiz: el.quizScreen,
    tictactoe: el.tictactoeScreen, puzzle: el.puzzleScreen, snake: el.snakeScreen, matching: el.matchingScreen, riddles: el.riddlesScreen,
    finish: el.finishScreen, stageComplete: el.stageComplete,
  };
  if (map[which]) map[which].classList.add("visible");
}

/* ── Stage chip / progress ── */
function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function nextHeartRegenInfo() {
  if (state.health >= state.maxHealth || !state.lastHeartLossAt) return null;
  const elapsedMs = Date.now() - Number(state.lastHeartLossAt);
  const alreadyEarned = HEART_REGEN_MINUTES.filter(min => elapsedMs >= min * 60000).length;
  const nextMinute = HEART_REGEN_MINUTES.find((min, index) => index >= alreadyEarned && state.health + alreadyEarned < state.maxHealth);
  if (!nextMinute) return null;
  return { nextMinute, remainingMs: (Number(state.lastHeartLossAt) + nextMinute * 60000) - Date.now() };
}

function updateHealthUI() {
  if (el.healthHearts) {
    const full = "❤ ".repeat(Math.max(0, state.health)).trim();
    const empty = "♡ ".repeat(Math.max(0, state.maxHealth - state.health)).trim();
    el.healthHearts.textContent = [full, empty].filter(Boolean).join(" ");
  }
  if (el.heartTimer) {
    const info = nextHeartRegenInfo();
    if (info && state.health < state.maxHealth) {
      el.heartTimer.classList.remove("hidden");
      el.heartTimer.textContent = `Next ❤️ in ${formatCountdown(info.remainingMs)}`;
    } else {
      el.heartTimer.classList.add("hidden");
      el.heartTimer.textContent = "";
    }
  }
}

function updateStageChip() {
  state.totalQuestionsInStage = Database.questionsForStage(state.stage);

  if (el.stageNumber) el.stageNumber.textContent = String(state.stage);
  if (el.stageMax) el.stageMax.textContent = String(state.maxStages);
  if (el.stageQCount) el.stageQCount.textContent = String(state.totalQuestionsInStage);

  const pct = Math.min(100, Math.round((state.questionIndex / state.totalQuestionsInStage) * 100));
  if (el.progressFill) el.progressFill.style.width = `${pct}%`;
  if (el.progressText) el.progressText.textContent =
    `${state.questionIndex} / ${state.totalQuestionsInStage}`;
  updateHealthUI();
}

function resetAnswerStyles() {
  el.answerBtns.forEach(btn => {
    btn.classList.remove("selected", "correct", "wrong");
    btn.disabled = false;
  });
  el.feedback.textContent = "";
  el.feedback.classList.remove("show", "correct", "wrong");
  if (el.nextBtn) el.nextBtn.classList.add("hidden");
  if (el.tryAgainBtn) el.tryAgainBtn.classList.add("hidden");
}

function renderQuestionText() {
  if (!state.currentQuestion) return;
  const q = state.currentQuestion;
  const qNum = state.questionIndex + 1;
  if (el.questionNumber) el.questionNumber.textContent = String(qNum);
  if (el.questionTotal) el.questionTotal.textContent = String(state.totalQuestionsInStage);
  el.questionText.textContent = state.lang === "ar" ? q.question_ar : q.question_en;
}

function renderAnswerTexts() {
  if (!state.currentQuestion) return;
  const q = state.currentQuestion;
  const map = {
    A: state.lang === "ar" ? (q.A_ar || q.A) : q.A,
    B: state.lang === "ar" ? (q.B_ar || q.B) : q.B,
    C: state.lang === "ar" ? (q.C_ar || q.C) : q.C,
    D: state.lang === "ar" ? (q.D_ar || q.D) : q.D,
  };
  el.answerBtns.forEach(btn => {
    btn.querySelector(".answer-text").textContent = map[btn.getAttribute("data-letter")];
  });
}

function renderFeedback() {
  if (!state.currentQuestion || !state.answered) return;
  const dict = i18n[state.lang];
  const q = state.currentQuestion;
  const ok = state.selectedLetter === q.correct_answer;
  el.feedback.classList.add("show");
  if (ok) {
    el.feedback.classList.add("correct");
    el.feedback.textContent = dict.correct;
  } else {
    el.feedback.classList.add("wrong");
    el.feedback.textContent = `${dict.wrong} \u2014 ${dict.correctAnswerIs} ${q.correct_answer}`;
  }
}

/* ── Question loading ── */
async function loadQuestion() {
  resetAnswerStyles();
  state.answered = false;
  state.selectedLetter = null;

  el.questionText.textContent = "\u2026";
  el.answerBtns.forEach(btn => { btn.querySelector(".answer-text").textContent = "\u2014"; });

  const question = await Database.getQuestion(state.stage, state.answeredQuestionIds);

  if (!question) {
    el.questionText.textContent = i18n[state.lang].noQuestion;
    return;
  }

  state.currentQuestion = question;
  el.questionBlock.classList.remove("slide-out");
  el.questionBlock.style.animation = "none";
  void el.questionBlock.offsetWidth;
  el.questionBlock.style.animation = "";

  renderQuestionText();
  renderAnswerTexts();
  updateStageChip();
  startQuizTimer();
}

/* ── Sound ── */
function playSfx(audio) {
  if (state.soundOff) return;
  try { audio.currentTime = 0; audio.play().catch(() => {}); } catch (_) {}
}

function stopQuizTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimerUI() {
  if (!el.quizTimeLeft || !el.quizTimer) return;
  el.quizTimeLeft.textContent = String(state.timeLeft);
  el.quizTimer.classList.toggle("danger", state.timeLeft <= 5);
}

function startQuizTimer() {
  stopQuizTimer();
  state.timeLeft = state.quizTimeLimit;
  updateTimerUI();
  state.timerId = setInterval(() => {
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    updateTimerUI();
    if (state.timeLeft > 0 && state.timeLeft <= 5) playSfx(el.sfxTick);
    if (state.timeLeft <= 0) handleTimeUp();
  }, 1000);
}

function handleTimeUp() {
  if (state.answered || !state.currentQuestion) return;
  stopQuizTimer();
  state.answered = true;
  const q = state.currentQuestion;
  el.answerBtns.forEach(btn => {
    btn.disabled = true;
    if (btn.getAttribute("data-letter") === q.correct_answer) btn.classList.add("correct");
  });
  loseHeart();
  el.feedback.classList.add("show", "wrong");
  el.feedback.textContent = `${i18n[state.lang].timeUp} — ${i18n[state.lang].correctAnswerIs} ${q.correct_answer}`;
  playSfx(el.sfxLose || el.sfxWrong);
  if (state.health <= 0) {
    el.feedback.textContent = i18n[state.lang].healthEmpty;
    setTimeout(() => restartCurrentStage(), 900);
    return;
  }
  if (el.tryAgainBtn) el.tryAgainBtn.classList.remove("hidden");
}

/* ── Answer handling ── */
function handleAnswer(letter) {
  if (state.answered || !state.currentQuestion) return;
  stopQuizTimer();
  state.answered = true;
  state.selectedLetter = letter;

  const q = state.currentQuestion;
  const ok = letter === q.correct_answer;

  el.answerBtns.forEach(btn => {
    btn.disabled = true;
    const l = btn.getAttribute("data-letter");
    if (l === letter) btn.classList.add("selected");
    if (l === q.correct_answer) btn.classList.add("correct");
    if (l === letter && !ok) btn.classList.add("wrong");
  });

  renderFeedback();
  playSfx(ok ? (el.sfxWin || el.sfxCorrect) : (el.sfxLose || el.sfxWrong));

  if (ok) {
    if (q.id) state.answeredQuestionIds.add(q.id);
    state.questionIndex++;
    if (el.nextBtn) el.nextBtn.classList.remove("hidden");
    el.nextBtn.focus();
  } else {
    loseHeart();
    if (state.health <= 0) {
      el.feedback.textContent = i18n[state.lang].healthEmpty;
      setTimeout(() => restartCurrentStage(), 900);
      return;
    }
    if (el.tryAgainBtn) el.tryAgainBtn.classList.remove("hidden");
  }
}

/* ── Advance to next question or stage ── */
async function advanceQuestion() {
  if (state.questionIndex >= state.totalQuestionsInStage) {
    // Stage complete
    if (state.stage >= state.maxStages) {
      showScreen("finish");
      return;
    }
    showStageComplete();
    return;
  }

  // Save progress
  saveCurrentProgress();

  el.questionBlock.classList.add("slide-out");
  await new Promise(r => setTimeout(r, 280));
  await loadQuestion();
}

/* ── Try again (wrong answer) ── */
async function tryAgain() {
  el.questionBlock.classList.add("slide-out");
  await new Promise(r => setTimeout(r, 280));
  await loadQuestion();
}

/* ── Stage complete ── */
function showStageComplete() {
  const dict = i18n[state.lang];
  const title = document.getElementById("stage-complete-title");
  const msg = document.getElementById("stage-complete-msg");
  const stageNum = document.getElementById("completed-stage-num");

  if (title) title.textContent = dict.stageComplete;
  if (msg) msg.textContent = dict.stageCompleteMsg;
  if (stageNum) stageNum.textContent = String(state.stage);

  playSfx(el.sfxWin || el.sfxCorrect);
  showScreen("stageComplete");
}

async function goToNextStage() {
  state.stage++;
  state.questionIndex = 0;
  state.health = state.maxHealth;
  state.totalQuestionsInStage = Database.questionsForStage(state.stage);
  state.answeredQuestionIds.clear();

  saveCurrentProgress();
  updateStageChip();

  showScreen("quiz");
  await loadQuestion();
}

/* ── Restart quiz ── */
async function restartQuiz() {
  state.stage = 1;
  state.questionIndex = 0;
  state.health = state.maxHealth;
  state.totalQuestionsInStage = Database.questionsForStage(1);
  state.answeredQuestionIds.clear();

  saveCurrentProgress();
  updateStageChip();
  await loadQuestion();
  showScreen("quiz");
}

async function restartCurrentStage() {
  state.questionIndex = 0;
  state.answeredQuestionIds.clear();
  saveCurrentProgress();
  updateStageChip();
  if (state.health <= 0) {
    updateHealthUI();
    showScreen("start");
    return;
  }
  await loadQuestion();
}

/* ── Extra games: Tic Tac Toe + Puzzle ── */
const ttt = { mode: "pvp", board: Array(9).fill(""), player: "X", active: false, scoreX: 0, scoreO: 0, round: 1, winningLine: [], scored: false };
const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function tttWinner() {
  for (const line of winLines) {
    const [a,b,c] = line;
    if (ttt.board[a] && ttt.board[a] === ttt.board[b] && ttt.board[a] === ttt.board[c]) return { mark: ttt.board[a], line };
  }
  return ttt.board.every(Boolean) ? { mark: "draw", line: [] } : null;
}
function tttWinningMark() {
  const result = tttWinner();
  return result && result.mark !== "draw" ? result.mark : result?.mark || null;
}
function tttName(mark) {
  const dict = i18n[state.lang];
  if (mark === "X") return dict.player1;
  return ttt.mode === "bot" ? dict.bot : dict.player2;
}
function updateTttScore() {
  if (!el.tttScore) return;
  const dict = i18n[state.lang];
  el.tttScore.innerHTML = `<strong>${tttName("X")}</strong> ${ttt.scoreX} <span>v</span> ${ttt.scoreO} <strong>${tttName("O")}</strong>`;
  if (el.tttRound) el.tttRound.textContent = `${dict.round}: ${ttt.round}`;
}
function renderTtt() {
  el.tttCells.forEach((cell, i) => {
    cell.textContent = ttt.board[i];
    cell.classList.toggle("filled", Boolean(ttt.board[i]));
    cell.classList.toggle("win-cell", ttt.winningLine.includes(i));
  });
  updateTttScore();
  const result = tttWinner();
  if (result?.mark === "draw") {
    el.tttStatus.textContent = i18n[state.lang].draw;
    if (el.tttWinIcon) el.tttWinIcon.textContent = "🤝";
    ttt.active = false;
    playSfx(el.sfxLose || el.sfxWrong);
  } else if (result?.mark) {
    ttt.winningLine = result.line;
    if (!ttt.scored) {
      if (result.mark === "X") ttt.scoreX += 1;
      if (result.mark === "O") ttt.scoreO += 1;
      ttt.scored = true;
      playSfx(ttt.mode === "bot" && result.mark === "O" ? (el.sfxLose || el.sfxWrong) : (el.sfxWin || el.sfxCorrect));
    }
    updateTttScore();
    const winnerName = tttName(result.mark);
    el.tttStatus.textContent = `${winnerName} ${i18n[state.lang].wins} ${i18n[state.lang].result}: ${ttt.scoreX} v ${ttt.scoreO}`;
    if (el.tttWinIcon) el.tttWinIcon.textContent = result.mark === "X" ? "🏆" : "👑";
    ttt.active = false;
    el.tttCells.forEach((cell, i) => cell.classList.toggle("win-cell", result.line.includes(i)));
  } else {
    if (el.tttWinIcon) el.tttWinIcon.textContent = "";
    el.tttStatus.textContent = `${i18n[state.lang].turn}: ${tttName(ttt.player)} (${ttt.player})`;
  }
}
function startTtt(mode = ttt.mode, resetScore = false) {
  const modeChanged = mode !== ttt.mode;
  ttt.mode = mode;
  if (resetScore || modeChanged) { ttt.scoreX = 0; ttt.scoreO = 0; ttt.round = 1; }
  else if (!ttt.active && ttt.board.some(Boolean)) { ttt.round += 1; }
  ttt.board = Array(9).fill(""); ttt.player = "X"; ttt.active = true; ttt.winningLine = []; ttt.scored = false;
  renderTtt();
}
function botMove() {
  if (!ttt.active || ttt.mode !== "bot" || ttt.player !== "O") return;
  const empty = ttt.board.map((v,i)=>v?null:i).filter(v=>v!==null);
  const best = empty.find(i => { ttt.board[i]="O"; const w=tttWinningMark()==="O"; ttt.board[i]=""; return w; })
    ?? empty.find(i => { ttt.board[i]="X"; const w=tttWinningMark()==="X"; ttt.board[i]=""; return w; })
    ?? (ttt.board[4] ? empty[Math.floor(Math.random()*empty.length)] : 4);
  ttt.board[best] = "O"; ttt.player = "X"; renderTtt();
}
function handleTttCell(index) {
  if (!ttt.active || ttt.board[index] || (ttt.mode === "bot" && ttt.player === "O")) return;
  ttt.board[index] = ttt.player;
  ttt.player = ttt.player === "X" ? "O" : "X";
  renderTtt();
  if (ttt.active && ttt.mode === "bot" && ttt.player === "O") {
    el.tttStatus.textContent = i18n[state.lang].botThinking;
    setTimeout(botMove, 350);
  }
}

const puzzle = { tiles: [1,2,3,4,5,6,7,8,0], moves: 0 };
function shufflePuzzle() {
  puzzle.tiles = [1,2,3,4,5,6,7,8,0]; puzzle.moves = 0;
  for (let i = 0; i < 90; i++) {
    const empty = puzzle.tiles.indexOf(0), neighbors = puzzleNeighbors(empty);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [puzzle.tiles[empty], puzzle.tiles[pick]] = [puzzle.tiles[pick], puzzle.tiles[empty]];
  }
  renderPuzzle();
}
function puzzleNeighbors(i) {
  const row = Math.floor(i / 3), col = i % 3, out = [];
  if (row > 0) out.push(i - 3); if (row < 2) out.push(i + 3);
  if (col > 0) out.push(i - 1); if (col < 2) out.push(i + 1);
  return out;
}
function renderPuzzle() {
  el.puzzleBoard.innerHTML = "";
  puzzle.tiles.forEach((value, index) => {
    const btn = document.createElement("button");
    btn.className = value ? "puzzle-tile" : "puzzle-tile empty";
    btn.textContent = value || "";
    btn.addEventListener("click", () => movePuzzle(index));
    el.puzzleBoard.appendChild(btn);
  });
  el.puzzleMoves.textContent = String(puzzle.moves);
  el.puzzleStatus.textContent = isPuzzleSolved() ? i18n[state.lang].puzzleSolved : i18n[state.lang].puzzleReady;
  if (isPuzzleSolved() && puzzle.moves > 0) {
    if (window.SoundManager) SoundManager.play('win');
    // Animate solved tiles
    el.puzzleBoard.querySelectorAll('.puzzle-tile:not(.empty)').forEach((tile, i) => {
      setTimeout(() => { tile.style.transform = 'scale(1.1)'; tile.style.borderColor = 'var(--success)'; }, i * 80);
    });
    const xp = Math.max(10, 200 - puzzle.moves * 3);
    const coins = Math.max(5, 50 - puzzle.moves);
    addPlayerReward(xp, coins);
    Toast.success(`Puzzle solved in ${puzzle.moves} moves! +${xp} XP +${coins} coins`);
    if (window.Rewards) Rewards.addWin();
  }
}
function movePuzzle(index) {
  const empty = puzzle.tiles.indexOf(0);
  if (!puzzleNeighbors(empty).includes(index)) return;
  [puzzle.tiles[empty], puzzle.tiles[index]] = [puzzle.tiles[index], puzzle.tiles[empty]];
  puzzle.moves++;
  if (window.SoundManager) SoundManager.play('click');
  renderPuzzle();
}
function isPuzzleSolved() { return puzzle.tiles.join(",") === "1,2,3,4,5,6,7,8,0"; }



/* ── Extra game: Picture matching puzzle ── */
const matchingIcons = ["🐶", "🐱", "🦊", "🐼", "🐸", "🦁", "🐵", "🐧", "🐨", "🐯"];
const matchingLevels = {
  1: { rows: 2, cols: 4, pairs: 4 },
  2: { rows: 4, cols: 4, pairs: 8 },
  3: { rows: 5, cols: 4, pairs: 10 },
};
const matchingDifficultyTime = { easy: 60, medium: 40, hard: 25 };
const rewardDifficultyBonus = { easy: 0, medium: 10, hard: 25 };
const matching = { cards: [], open: [], locked: false, moves: 0, found: 0, totalPairs: 4, level: 1, difficulty: "easy", timeLeft: 60, timerId: null, active: false, combo: 0, maxCombo: 0, rewarded: false };
function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function saveHealthState() {
  localStorage.setItem(LS_HEALTH_KEY, JSON.stringify({
    health: state.health,
    lastHeartLossAt: state.lastHeartLossAt
  }));
}
function restoreHealthState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_HEALTH_KEY) || "{}");
    state.health = Math.max(0, Math.min(state.maxHealth, Number(saved.health ?? state.maxHealth)));
    state.lastHeartLossAt = saved.lastHeartLossAt || null;
  } catch (_) {}
  applyHeartRegen();
}
function applyHeartRegen() {
  if (state.health >= state.maxHealth || !state.lastHeartLossAt) { updateHealthUI(); return; }
  const elapsed = Math.floor((Date.now() - Number(state.lastHeartLossAt)) / 60000);
  let targetHealth = state.health;
  HEART_REGEN_MINUTES.forEach((mins, index) => {
    if (elapsed >= mins) targetHealth = Math.max(targetHealth, Math.min(state.maxHealth, index + 1));
  });
  if (targetHealth !== state.health) {
    state.health = Math.min(state.maxHealth, targetHealth);
    if (state.health >= state.maxHealth) state.lastHeartLossAt = null;
    saveHealthState();
  }
  updateHealthUI();
}
function startHeartRegenTicker() {
  if (state.heartRegenTimerId) clearInterval(state.heartRegenTimerId);
  state.heartRegenTimerId = setInterval(applyHeartRegen, 1000);
  applyHeartRegen();
}
function loseHeart() {
  state.health = Math.max(0, state.health - 1);
  if (state.health < state.maxHealth && !state.lastHeartLossAt) state.lastHeartLossAt = Date.now();
  if (state.health === 0) state.lastHeartLossAt = Date.now();
  saveHealthState();
  updateHealthUI();
}
function setStoreMessage(message, ok = true) {
  const node = document.getElementById("store-message") || el.storeMessage;
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("error", !ok);
  node.classList.toggle("success", ok);
}
function buyHearts(count) {
  applyHeartRegen();
  const price = HEART_STORE[count];
  if (!price) return false;
  if (state.health >= state.maxHealth) { setStoreMessage("Hearts already full.", false); return false; }
  if (state.playerCoins < price) { setStoreMessage(`Not enough coins. Need ${price} coins.`, false); return false; }
  const before = state.health;
  state.playerCoins -= price;
  state.health = Math.min(state.maxHealth, state.health + count);
  if (state.health >= state.maxHealth) state.lastHeartLossAt = null;
  savePlayerStats();
  saveHealthState();
  updateHealthUI();
  setStoreMessage(`Bought +${state.health - before} heart${state.health - before === 1 ? "" : "s"}!`, true);
  return true;
}
window.buyHearts = buyHearts;

function loadPlayerStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_STATS_KEY) || "{}");
    state.playerLevel = Math.max(0, Number(saved.level) || 0);
    state.playerXp = Math.max(0, Number(saved.xp) || 0);
    state.playerCoins = Math.max(0, Number(saved.coins) || 0);
  } catch (_) {}
  updatePlayerStatsUI();
}
function savePlayerStats() {
  localStorage.setItem(LS_STATS_KEY, JSON.stringify({ level: state.playerLevel, xp: state.playerXp, coins: state.playerCoins }));
  updatePlayerStatsUI();
}
function xpNeededForNextLevel(level) {
  if (level <= 0) return 200;
  if (level === 1) return 350;
  return 350 + ((level - 1) * 150);
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function updatePlayerStatsUI() {
  const need = xpNeededForNextLevel(state.playerLevel);
  const pct = need > 0 ? Math.max(0, Math.min(100, (state.playerXp / need) * 100)) : 0;
  if (el.navLevel) el.navLevel.textContent = String(state.playerLevel);
  if (el.navXp) el.navXp.textContent = `${state.playerXp}/${need}`;
  if (el.navXpFill) el.navXpFill.style.width = `${pct}%`;
  if (el.navCoins) el.navCoins.textContent = String(state.playerCoins);
}
function addPlayerReward(xp, coins) {
  const earnedXp = Math.max(0, Math.floor(xp));
  const earnedCoins = Math.max(0, Math.floor(coins));
  state.playerXp += earnedXp;
  state.playerCoins += earnedCoins;
  let leveledUp = 0;
  while (state.playerXp >= xpNeededForNextLevel(state.playerLevel)) {
    state.playerXp -= xpNeededForNextLevel(state.playerLevel);
    state.playerLevel += 1;
    leveledUp += 1;
    state.playerCoins += 25; // level-up bonus
  }
  savePlayerStats();
  return { xp: earnedXp, coins: earnedCoins, leveledUp };
}
function getWinReward(gameLevel = 1, difficulty = "easy", combo = 0) {
  const diffBonus = rewardDifficultyBonus[difficulty] || 0;
  const comboBonus = Math.max(0, combo) * randInt(3, 8);
  return {
    xp: randInt(100, 160) + diffBonus + (gameLevel * randInt(8, 15)) + comboBonus,
    coins: randInt(15, 30) + Math.floor(diffBonus / 5) + gameLevel + Math.floor(comboBonus / 10),
    comboBonus
  };
}
function getLoseReward() {
  return { xp: randInt(10, 25), coins: randInt(5, 10) };
}
window.addPlayerReward = addPlayerReward;

function formatRewardText(reward) {
  const up = reward.leveledUp ? ` | LEVEL UP +${reward.leveledUp}!` : "";
  return `+${reward.xp} XP +${reward.coins} coins${up}`;
}
function stopMatchingTimer() {
  if (matching.timerId) clearInterval(matching.timerId);
  matching.timerId = null;
}
function startMatchingTimer() {
  stopMatchingTimer();
  matching.timerId = setInterval(() => {
    matching.timeLeft -= 1;
    if (el.matchingTime) el.matchingTime.textContent = String(matching.timeLeft);
    if (matching.timeLeft > 0 && matching.timeLeft <= 5) playSfx(el.sfxTick);
    if (matching.timeLeft <= 0) {
      stopMatchingTimer();
      matching.active = false;
      matching.locked = true;
      if (el.matchingStatus) el.matchingStatus.textContent = i18n[state.lang].matchingTimeUp;
      if (!matching.rewarded) {
        matching.rewarded = true;
        const reward = addPlayerReward(...Object.values(getLoseReward()));
        if (el.matchingStatus) el.matchingStatus.textContent = `${i18n[state.lang].matchingTimeUp} ${formatRewardText(reward)}`;
      } else if (el.matchingStatus) {
        el.matchingStatus.textContent = i18n[state.lang].matchingTimeUp;
      }
      playSfx(el.sfxLose || el.sfxWrong);
      renderMatchingGame();
    }
  }, 1000);
}
function startMatchingGame() {
  matching.level = Number(el.matchingLevel?.value || 1);
  matching.difficulty = el.matchingDifficulty?.value || "easy";
  const cfg = matchingLevels[matching.level] || matchingLevels[1];
  matching.totalPairs = cfg.pairs;
  matching.timeLeft = matchingDifficultyTime[matching.difficulty] || 60;
  const icons = matchingIcons.slice(0, matching.totalPairs);
  matching.cards = shuffleArray([...icons, ...icons]).map((icon, index) => ({ icon, id: index, open: false, done: false }));
  matching.open = [];
  matching.locked = false;
  matching.moves = 0;
  matching.found = 0;
  matching.active = true;
  matching.combo = 0;
  matching.maxCombo = 0;
  matching.rewarded = false;
  if (el.matchingBoard) el.matchingBoard.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
  renderMatchingGame();
  startMatchingTimer();
  if (el.matchingStatus) el.matchingStatus.textContent = i18n[state.lang].matchingReady;
}
function renderMatchingGame() {
  if (!el.matchingBoard) return;
  el.matchingBoard.innerHTML = "";
  matching.cards.forEach((card, index) => {
    const btn = document.createElement("button");
    btn.className = "matching-card";
    if (card.open || card.done) btn.classList.add("open");
    if (card.done) btn.classList.add("matched");
    btn.disabled = !matching.active || matching.locked;
    btn.setAttribute("aria-label", card.open || card.done ? card.icon : "Hidden picture");
    btn.innerHTML = `<span class="card-back">?</span><span class="card-face">${card.icon}</span>`;
    btn.addEventListener("click", () => flipMatchingCard(index));
    el.matchingBoard.appendChild(btn);
  });
  if (el.matchingMoves) el.matchingMoves.textContent = String(matching.moves);
  if (el.matchingScore) el.matchingScore.textContent = `${matching.found} / ${matching.totalPairs}`;
  if (el.matchingTime) el.matchingTime.textContent = String(matching.timeLeft);
  if (el.matchingLevelLabel) el.matchingLevelLabel.textContent = String(matching.level);
  if (el.matchingDifficultyLabel) el.matchingDifficultyLabel.textContent = i18n[state.lang][matching.difficulty] || matching.difficulty;
}
function flipMatchingCard(index) {
  if (matching.locked || !matching.active) return;
  const card = matching.cards[index];
  if (!card || card.open || card.done) return;
  card.open = true;
  matching.open.push(index);
  if (el.matchingStatus) el.matchingStatus.textContent = i18n[state.lang].matchingPick;
  renderMatchingGame();
  if (matching.open.length < 2) return;
  matching.moves += 1;
  const [a, b] = matching.open;
  const good = matching.cards[a].icon === matching.cards[b].icon;
  matching.locked = true;
  setTimeout(() => {
    if (good) {
      matching.cards[a].done = true;
      matching.cards[b].done = true;
      matching.found += 1;
      matching.combo += 1;
      matching.maxCombo = Math.max(matching.maxCombo, matching.combo);
      if (el.matchingStatus) el.matchingStatus.textContent = `${i18n[state.lang].matchingGood} Combo x${matching.combo}`;
      playSfx(el.sfxCorrect);
      if (matching.found === matching.totalPairs) {
        stopMatchingTimer();
        matching.active = false;
        if (!matching.rewarded) {
          matching.rewarded = true;
          const calc = getWinReward(matching.level, matching.difficulty, matching.maxCombo);
          const reward = addPlayerReward(calc.xp, calc.coins);
          const comboText = calc.comboBonus ? ` Combo bonus +${calc.comboBonus} XP.` : "";
          if (el.matchingStatus) el.matchingStatus.textContent = `${i18n[state.lang].matchingComplete} ${formatRewardText(reward)}.${comboText}`;
        }
        playSfx(el.sfxWin || el.sfxCorrect);
      }
    } else {
      matching.cards[a].open = false;
      matching.cards[b].open = false;
      matching.combo = 0;
      if (el.matchingStatus) el.matchingStatus.textContent = i18n[state.lang].matchingWrong;
      playSfx(el.sfxWrong);
    }
    matching.open = [];
    matching.locked = false;
    renderMatchingGame();
  }, good ? 350 : 650);
}


/* ── Extra game: Snake with levels + skins ── */
const snakeLevels = { easy: 160, medium: 115, hard: 80 };
const snakeSkins = {
  classic: { head: "#46e6ff", body: "#4aa8ff", food: "#ff6fb5" },
  fire: { head: "#ffd36a", body: "#ff6b35", food: "#46e6ff" },
  ice: { head: "#dff7ff", body: "#74d4ff", food: "#ff6fb5" },
  gold: { head: "#fff2a8", body: "#f6c945", food: "#a16bff" },
};
const snake = { size: 21, cell: 20, body: [], food: {x: 14, y: 10}, dir: {x: 1, y: 0}, nextDir: {x: 1, y: 0}, score: 0, level: "easy", skin: "classic", timer: null, running: false, paused: false };
function syncSnakeLabels() {
  const dict = i18n[state.lang];
  if (el.snakeLevelLabel) el.snakeLevelLabel.textContent = dict[snake.level] || snake.level;
  if (el.snakeSkinLabel) el.snakeSkinLabel.textContent = dict[snake.skin] || snake.skin;
  if (el.snakeScore) el.snakeScore.textContent = String(snake.score);
}
function drawSnake() {
  if (!el.snakeCanvas) return;
  const ctx = el.snakeCanvas.getContext("2d");
  const w = el.snakeCanvas.width, h = el.snakeCanvas.height;
  snake.cell = w / snake.size;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i <= snake.size; i++) {
    ctx.beginPath(); ctx.moveTo(i * snake.cell, 0); ctx.lineTo(i * snake.cell, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * snake.cell); ctx.lineTo(w, i * snake.cell); ctx.stroke();
  }
  const colors = snakeSkins[snake.skin] || snakeSkins.classic;
  ctx.fillStyle = colors.food;
  ctx.beginPath();
  ctx.arc((snake.food.x + 0.5) * snake.cell, (snake.food.y + 0.5) * snake.cell, snake.cell * 0.36, 0, Math.PI * 2);
  ctx.fill();
  snake.body.forEach((part, i) => {
    ctx.fillStyle = i === 0 ? colors.head : colors.body;
    const pad = i === 0 ? 2 : 3;
    const x = part.x * snake.cell + pad, y = part.y * snake.cell + pad, r = 7;
    const bw = snake.cell - pad * 2, bh = snake.cell - pad * 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, bw, bh, r) : ctx.rect(x, y, bw, bh);
    ctx.fill();
  });
}
function resetSnake() {
  snake.body = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
  snake.dir = {x: 1, y: 0}; snake.nextDir = {x: 1, y: 0};
  snake.score = 0; snake.running = false; snake.paused = false;
  placeSnakeFood(); syncSnakeLabels(); drawSnake();
  if (el.snakeStatus) el.snakeStatus.textContent = i18n[state.lang].snakeReady;
  if (el.snakePauseBtn) el.snakePauseBtn.textContent = i18n[state.lang].pause;
}
function startSnake() {
  stopSnake();
  resetSnake();
  snake.running = true;
  snake.paused = false;
  if (el.snakeStatus) el.snakeStatus.textContent = i18n[state.lang].snakeRunning;
  snake.timer = setInterval(stepSnake, snakeLevels[snake.level] || snakeLevels.easy);
}
function stopSnake() {
  if (snake.timer) clearInterval(snake.timer);
  snake.timer = null; snake.running = false;
}
function toggleSnakePause() {
  if (!snake.running && !snake.timer) return;
  snake.paused = !snake.paused;
  if (el.snakeStatus) el.snakeStatus.textContent = snake.paused ? i18n[state.lang].snakePaused : i18n[state.lang].snakeRunning;
  if (el.snakePauseBtn) el.snakePauseBtn.textContent = snake.paused ? i18n[state.lang].resume : i18n[state.lang].pause;
}
function placeSnakeFood() {
  do {
    snake.food = { x: Math.floor(Math.random() * snake.size), y: Math.floor(Math.random() * snake.size) };
  } while (snake.body.some(p => p.x === snake.food.x && p.y === snake.food.y));
}
function setSnakeDirection(name) {
  const dirs = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
  const nd = dirs[name];
  if (!nd) return;
  if (nd.x === -snake.dir.x && nd.y === -snake.dir.y) return;
  snake.nextDir = nd;
}
function stepSnake() {
  if (!snake.running || snake.paused) return;
  snake.dir = snake.nextDir;
  const head = snake.body[0];
  const next = { x: head.x + snake.dir.x, y: head.y + snake.dir.y };
  const hitWall = next.x < 0 || next.y < 0 || next.x >= snake.size || next.y >= snake.size;
  const hitSelf = snake.body.some(p => p.x === next.x && p.y === next.y);
  if (hitWall || hitSelf) {
    stopSnake();
    const reward = addPlayerReward(...Object.values(getLoseReward()));
    if (el.snakeStatus) el.snakeStatus.textContent = `${i18n[state.lang].snakeGameOver} ${formatRewardText(reward)}`;
    drawSnake();
    // Save best score
    const best = parseInt(localStorage.getItem('GameZone:snakeBest') || '0', 10);
    if (snake.score > best) localStorage.setItem('GameZone:snakeBest', String(snake.score));
    // Show professional Game Over overlay
    showSnakeGameOver();
    return;
  }
  snake.body.unshift(next);
  if (next.x === snake.food.x && next.y === snake.food.y) {
    snake.score += 1;
    syncSnakeLabels();
    playSfx(el.sfxCorrect);
    placeSnakeFood();
  } else {
    snake.body.pop();
  }
  drawSnake();
}
function updateSnakeSettings() {
  if (el.snakeLevel) snake.level = el.snakeLevel.value;
  if (el.snakeSkin) snake.skin = el.snakeSkin.value;
  syncSnakeLabels(); drawSnake();
  if (snake.running) {
    if (snake.timer) clearInterval(snake.timer);
    snake.timer = setInterval(stepSnake, snakeLevels[snake.level] || snakeLevels.easy);
  }
}


/* ── Riddles game ── */
const riddleTemplates = [
  { ar: { q: "ما هو الشيء الذي يكون أمامك دائمًا ولا تستطيع رؤيته؟", a: "المستقبل", wrong: ["الماضي", "الظل", "الهواء"] }, en: { q: "What is always in front of you but you cannot see it?", a: "The future", wrong: ["The past", "A shadow", "The air"] } },
  { ar: { q: "شيء كلما أخذت منه كبر، ما هو؟", a: "الحفرة", wrong: ["البحر", "الكتاب", "النار"] }, en: { q: "What gets bigger the more you take away from it?", a: "A hole", wrong: ["The sea", "A book", "Fire"] } },
  { ar: { q: "ما الشيء الذي يكتب ولا يقرأ؟", a: "القلم", wrong: ["الكتاب", "الساعة", "الباب"] }, en: { q: "What writes but cannot read?", a: "A pen", wrong: ["A book", "A clock", "A door"] } },
  { ar: { q: "له أسنان ولا يعض، ما هو؟", a: "المشط", wrong: ["الكلب", "السمك", "المفتاح"] }, en: { q: "What has teeth but never bites?", a: "A comb", wrong: ["A dog", "A fish", "A key"] } },
  { ar: { q: "ما الشيء الذي يمشي بلا أرجل؟", a: "الوقت", wrong: ["القلم", "الشجرة", "الكأس"] }, en: { q: "What moves without legs?", a: "Time", wrong: ["A pen", "A tree", "A cup"] } },
  { ar: { q: "ما الشيء الذي إذا غليته تجمد؟", a: "البيض", wrong: ["الماء", "الحليب", "الشاي"] }, en: { q: "What becomes solid when you boil it?", a: "An egg", wrong: ["Water", "Milk", "Tea"] } },
  { ar: { q: "ما الشيء الذي يسمع بلا أذن ويتكلم بلا لسان؟", a: "الصدى", wrong: ["الراديو", "الكتاب", "الظل"] }, en: { q: "What hears without ears and speaks without a tongue?", a: "Echo", wrong: ["Radio", "A book", "A shadow"] } },
  { ar: { q: "بيت بلا أبواب ولا نوافذ، ما هو؟", a: "البيضة", wrong: ["الصندوق", "الغرفة", "القصر"] }, en: { q: "What house has no doors and no windows?", a: "An egg", wrong: ["A box", "A room", "A palace"] } },
  { ar: { q: "شيء تراه في الليل ثلاث مرات وفي النهار مرة واحدة؟", a: "حرف اللام", wrong: ["القمر", "النجوم", "الظل"] }, en: { q: "What appears three times in Arabic word 'night' and once in Arabic word 'day'?", a: "The letter ل", wrong: ["The moon", "The stars", "A shadow"] } },
  { ar: { q: "ما الشيء الذي له عين ولا يرى؟", a: "الإبرة", wrong: ["الإنسان", "القطة", "الكاميرا"] }, en: { q: "What has an eye but cannot see?", a: "A needle", wrong: ["A person", "A cat", "A camera"] } }
];
const RIDDLE_TOTAL = 9950;
function getRiddleLevelSize(level) {
  const usedBefore = ((level - 1) * level / 2) * 10;
  return Math.max(0, Math.min(level * 10, RIDDLE_TOTAL - usedBefore));
}
function getRiddleLevelStart(level) {
  return ((level - 1) * level / 2) * 10;
}
function getMaxRiddleLevel() {
  let level = 1;
  while (getRiddleLevelStart(level) < RIDDLE_TOTAL) level += 1;
  return level - 1;
}
const riddles = { index: 0, level: 1, levelTotal: 10, total: RIDDLE_TOTAL, timeLimit: 30, timeLeft: 30, timerId: null, answered: false, score: 0, combo: 0, current: null, usedIndices: new Set() };
function setupRiddleLevels() {
  if (!el.riddlesLevel) return;
  const max = getMaxRiddleLevel();
  el.riddlesLevel.innerHTML = "";
  for (let lvl = 1; lvl <= max; lvl += 1) {
    const size = getRiddleLevelSize(lvl);
    const opt = document.createElement("option");
    opt.value = String(lvl);
    opt.textContent = state.lang === "ar" ? `المستوى ${lvl} - ${size} لغز` : `Level ${lvl} - ${size} riddles`;
    el.riddlesLevel.appendChild(opt);
  }
  el.riddlesLevel.value = String(riddles.level);
}
function buildRiddle(localIndex) {
  const globalIndex = getRiddleLevelStart(riddles.level) + localIndex;
  const source = riddleTemplates[globalIndex % riddleTemplates.length];
  const base = source[state.lang] || source.en;
  const cycle = Math.floor(globalIndex / riddleTemplates.length) + 1;
  const question = globalIndex === 0 ? base.q : `${base.q} (${cycle})`;
  const choices = [base.a, ...base.wrong].map((text, i) => ({ letter: "ABCD"[i], text }));
  const shift = (globalIndex * 7) % 4;
  const rotated = choices.slice(shift).concat(choices.slice(0, shift));
  return { question, choices: rotated.map((c, i) => ({ letter: "ABCD"[i], text: c.text, good: c.text === base.a })), correct: base.a };
}
function startRiddlesGame() {
  if (el.riddlesLevel) riddles.level = parseInt(el.riddlesLevel.value || "1", 10);
  riddles.levelTotal = getRiddleLevelSize(riddles.level);
  riddles.index = 0; riddles.score = 0; riddles.combo = 0;
  riddles.usedIndices = new Set(); // Reset used riddles tracker
  setupRiddleLevels();
  loadRiddle();
}
function stopRiddleTimer() {
  if (riddles.timerId) clearInterval(riddles.timerId);
  riddles.timerId = null;
}
function startRiddleTimer() {
  stopRiddleTimer();
  riddles.timeLeft = riddles.timeLimit;
  if (el.riddlesTime) el.riddlesTime.textContent = String(riddles.timeLeft);
  riddles.timerId = setInterval(() => {
    riddles.timeLeft -= 1;
    if (el.riddlesTime) el.riddlesTime.textContent = String(riddles.timeLeft);
    if (riddles.timeLeft <= 5 && riddles.timeLeft > 0) playSfx(el.sfxTick);
    if (riddles.timeLeft <= 0) {
      stopRiddleTimer();
      failRiddle(i18n[state.lang].riddleTimeUp || "Time up!");
    }
  }, 1000);
}
function loadRiddle() {
  riddles.answered = false;
  // Skip already-used indices to prevent repetition
  while (riddles.usedIndices.has(riddles.index) && riddles.index < riddles.levelTotal) {
    riddles.index++;
  }
  if (riddles.index >= riddles.levelTotal) {
    riddles.usedIndices.clear(); // Reset if all used
    riddles.index = 0;
  }
  riddles.usedIndices.add(riddles.index);
  riddles.current = buildRiddle(riddles.index);
  renderRiddleQuestion();
  startRiddleTimer();
}
function renderRiddleQuestion() {
  if (!el.riddlesScreen) return;
  if (el.riddlesLevel && el.riddlesLevel.options.length === 0) setupRiddleLevels();
  if (!riddles.current) return;
  if (el.riddlesStatus) el.riddlesStatus.textContent = state.lang === "ar" ? `المستوى ${riddles.level}: اختر الإجابة الصحيحة.` : `Level ${riddles.level}: Choose the correct answer.`;
  if (el.riddlesLevelLabel) el.riddlesLevelLabel.textContent = String(riddles.level);
  if (el.riddlesCount) el.riddlesCount.textContent = `${riddles.index + 1} / ${riddles.levelTotal}`;
  if (el.riddlesScore) el.riddlesScore.textContent = String(riddles.score);
  if (el.riddlesCombo) el.riddlesCombo.textContent = String(riddles.combo);
  if (el.riddleNumber) el.riddleNumber.textContent = state.lang === "ar" ? `المستوى ${riddles.level} - لغز ${riddles.index + 1}` : `Level ${riddles.level} - Riddle ${riddles.index + 1}`;
  if (el.riddleQuestion) el.riddleQuestion.textContent = riddles.current.question;
  if (el.riddlesFeedback) { el.riddlesFeedback.textContent = ""; el.riddlesFeedback.className = "feedback"; }
  if (el.riddlesNextBtn) el.riddlesNextBtn.classList.add("hidden");
  if (el.riddleAnswerBtns) el.riddleAnswerBtns.forEach((btn, i) => {
    const choice = riddles.current.choices[i];
    btn.disabled = false;
    btn.classList.remove("correct", "wrong", "selected");
    btn.querySelector(".answer-text").textContent = choice ? choice.text : "—";
  });
}
function handleRiddleAnswer(letter) {
  if (riddles.answered || !riddles.current) return;
  const idx = "ABCD".indexOf(letter);
  const choice = riddles.current.choices[idx];
  if (!choice) return;
  riddles.answered = true;
  stopRiddleTimer();
  if (choice.good) {
    riddles.combo += 1;
    riddles.score += 1;
    const calc = getWinReward(1, "easy", riddles.combo);
    const reward = addPlayerReward(calc.xp, calc.coins);
    if (el.riddlesFeedback) { el.riddlesFeedback.textContent = `${i18n[state.lang].riddleCorrect || "Correct!"} ${formatRewardText(reward)} | Combo x${riddles.combo}`; el.riddlesFeedback.className = "feedback success"; }
    playSfx(el.sfxWin || el.sfxCorrect);
  } else {
    failRiddle(i18n[state.lang].riddleWrong || "Wrong answer!");
  }
  finishRiddleButtons(idx);
}
function failRiddle(message) {
  riddles.answered = true;
  riddles.combo = 0;
  const reward = addPlayerReward(...Object.values(getLoseReward()));
  if (el.riddlesFeedback) { el.riddlesFeedback.textContent = `${message} ${i18n[state.lang].correctAnswerIs || "Correct answer:"} ${riddles.current.correct}. ${formatRewardText(reward)}`; el.riddlesFeedback.className = "feedback error"; }
  playSfx(el.sfxLose || el.sfxWrong);
  finishRiddleButtons(-1);
}
function finishRiddleButtons(selectedIdx) {
  if (el.riddleAnswerBtns) el.riddleAnswerBtns.forEach((btn, i) => {
    const choice = riddles.current.choices[i];
    btn.disabled = true;
    if (choice && choice.good) btn.classList.add("correct");
    if (i === selectedIdx && choice && !choice.good) btn.classList.add("wrong");
  });
  if (el.riddlesScore) el.riddlesScore.textContent = String(riddles.score);
  if (el.riddlesCombo) el.riddlesCombo.textContent = String(riddles.combo);
  if (el.riddlesNextBtn) el.riddlesNextBtn.classList.remove("hidden");
}
function nextRiddle() {
  if (riddles.index + 1 >= riddles.levelTotal) {
    stopRiddleTimer();
    if (el.riddlesStatus) el.riddlesStatus.textContent = i18n[state.lang].levelComplete || i18n[state.lang].riddleComplete || "Level complete!";
    if (el.riddlesFeedback) { el.riddlesFeedback.textContent = i18n[state.lang].riddleComplete || "Complete!"; el.riddlesFeedback.className = "feedback success"; }
    playSfx(el.sfxWin || el.sfxCorrect);
    return;
  }
  riddles.index += 1;
  loadRiddle();
}
/* ── Save/load progress helpers ── */
function saveCurrentProgress() {
  const data = { stage: state.stage, questionIndex: state.questionIndex };
  Database.saveLocalProgress(data);
  if (window._authUser) {
    Database.saveProgress(window._authUser, data).catch(() => {});
  }
}

/* ── Init (called when app is ready) ── */
async function init(user) {
  cacheEls();

  // Restore lang
  const savedLang = localStorage.getItem(LS_LANG_KEY);
  if (savedLang === "ar" || savedLang === "en") state.lang = savedLang;

  // Restore progress: cloud first, then localStorage
  let progress = { stage: 1, questionIndex: 0 };
  if (user) {
    const cloudProgress = await Database.loadProgress(user).catch(() => null);
    if (cloudProgress) {
      progress = cloudProgress;
    } else {
      progress = Database.loadLocalProgress();
    }
  } else {
    progress = Database.loadLocalProgress();
  }

  state.stage = Math.max(1, progress.stage || 1);
  state.questionIndex = Math.max(0, progress.questionIndex || 0);
  state.totalQuestionsInStage = Database.questionsForStage(state.stage);

  applyLang();
  state.maxStages = await Database.getMaxStages();
  updateStageChip();
  loadPlayerStats();
  restoreHealthState();
  startHeartRegenTicker();

  // Events
  el.langToggle.addEventListener("click", toggleLang);
  el.playBtn.addEventListener("click", async () => { showScreen("quiz"); await loadQuestion(); });
  el.tictactoeMenuBtn.addEventListener("click", () => { showScreen("tictactoe"); startTtt("pvp", true); });
  el.puzzleMenuBtn.addEventListener("click", () => { showScreen("puzzle"); shufflePuzzle(); });
  el.snakeMenuBtn.addEventListener("click", () => { showScreen("snake"); resetSnake(); });
  el.matchingMenuBtn.addEventListener("click", () => { showScreen("matching"); startMatchingGame(); });
  if (el.riddlesMenuBtn) el.riddlesMenuBtn.addEventListener("click", () => { showScreen("riddles"); setupRiddleLevels(); startRiddlesGame(); });
  
  // New game buttons
  const flappyMenuBtn = document.getElementById("flappy-menu-btn");
  const mathMenuBtn = document.getElementById("math-menu-btn");
  const runnerMenuBtn = document.getElementById("runner-menu-btn");
  if (flappyMenuBtn) flappyMenuBtn.addEventListener("click", () => { showScreen("flappy"); if (window.FlappyGame) FlappyGame.init(); });
  if (mathMenuBtn) mathMenuBtn.addEventListener("click", () => { showScreen("math"); if (window.MathGame) MathGame.init(); });
  if (runnerMenuBtn) runnerMenuBtn.addEventListener("click", () => { showScreen("runner"); if (window.RunnerGame) RunnerGame.init(); });
  
  // Home buttons for new game screens
  const flappyHomeBtn = document.getElementById("flappy-home-btn");
  const mathHomeBtn = document.getElementById("math-home-btn");
  const runnerHomeBtn = document.getElementById("runner-home-btn");
  const shopHomeBtn = document.getElementById("shop-home-btn");
  const rewardsHomeBtn = document.getElementById("rewards-home-btn");
  const leaderboardHomeBtn = document.getElementById("leaderboard-home-btn");
  const achievementsHomeBtn = document.getElementById("achievements-home-btn");
  if (flappyHomeBtn) flappyHomeBtn.addEventListener("click", () => showScreen("start"));
  if (mathHomeBtn) mathHomeBtn.addEventListener("click", () => showScreen("start"));
  if (runnerHomeBtn) runnerHomeBtn.addEventListener("click", () => showScreen("start"));
  if (shopHomeBtn) shopHomeBtn.addEventListener("click", () => showScreen("start"));
  if (rewardsHomeBtn) rewardsHomeBtn.addEventListener("click", () => showScreen("start"));
  if (leaderboardHomeBtn) leaderboardHomeBtn.addEventListener("click", () => showScreen("start"));
  if (achievementsHomeBtn) achievementsHomeBtn.addEventListener("click", () => showScreen("start"));

  el.playAgainBtn.addEventListener("click", restartQuiz);
  if (el.restartBtn) el.restartBtn.addEventListener("click", restartQuiz);
  if (el.quizBackBtn) el.quizBackBtn.addEventListener("click", () => showScreen("start"));
  if (el.nextStageBtn) el.nextStageBtn.addEventListener("click", goToNextStage);

  el.answerBtns.forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(btn.getAttribute("data-letter")));
  });
  if (el.nextBtn) el.nextBtn.addEventListener("click", advanceQuestion);
  if (el.tryAgainBtn) el.tryAgainBtn.addEventListener("click", tryAgain);

  el.tttPvpBtn.addEventListener("click", () => startTtt("pvp", true));
  el.tttBotBtn.addEventListener("click", () => startTtt("bot", true));
  el.tttResetBtn.addEventListener("click", () => startTtt(ttt.mode, false));
  el.tttHomeBtn.addEventListener("click", () => showScreen("start"));
  el.tttCells.forEach(cell => cell.addEventListener("click", () => handleTttCell(Number(cell.dataset.index))));

  el.puzzleNewBtn.addEventListener("click", shufflePuzzle);
  el.puzzleHomeBtn.addEventListener("click", () => showScreen("start"));

  el.matchingNewBtn.addEventListener("click", startMatchingGame);
  if (el.matchingLevel) el.matchingLevel.addEventListener("change", startMatchingGame);
  if (el.matchingDifficulty) el.matchingDifficulty.addEventListener("change", startMatchingGame);
  el.matchingHomeBtn.addEventListener("click", () => showScreen("start"));

  if (el.riddleAnswerBtns) el.riddleAnswerBtns.forEach(btn => btn.addEventListener("click", () => handleRiddleAnswer(btn.getAttribute("data-riddle-letter"))));
  if (el.riddlesLevel) el.riddlesLevel.addEventListener("change", startRiddlesGame);
  if (el.riddlesNextBtn) el.riddlesNextBtn.addEventListener("click", nextRiddle);
  if (el.riddlesRestartBtn) el.riddlesRestartBtn.addEventListener("click", startRiddlesGame);
  if (el.riddlesHomeBtn) el.riddlesHomeBtn.addEventListener("click", () => showScreen("start"));

  el.snakeStartBtn.addEventListener("click", startSnake);
  el.snakePauseBtn.addEventListener("click", toggleSnakePause);
  el.snakeHomeBtn.addEventListener("click", () => showScreen("start"));
  el.snakeLevel.addEventListener("change", updateSnakeSettings);
  el.snakeSkin.addEventListener("change", updateSnakeSettings);
  el.snakeMobileBtns.forEach(btn => btn.addEventListener("click", () => setSnakeDirection(btn.dataset.dir)));

  // Keyboard
  document.addEventListener("keydown", evt => {
    if (evt.repeat) return;
    const key = evt.key.toUpperCase();
    if (el.quizScreen && el.quizScreen.classList.contains("visible")) {
      if (["A", "B", "C", "D"].includes(key)) handleAnswer(key);
      else if (evt.key === "Enter") {
        if (el.nextBtn && !el.nextBtn.classList.contains("hidden")) advanceQuestion();
        else if (el.tryAgainBtn && !el.tryAgainBtn.classList.contains("hidden")) tryAgain();
      }
    }
    if (el.riddlesScreen && el.riddlesScreen.classList.contains("visible")) {
      if (["A", "B", "C", "D"].includes(key)) handleRiddleAnswer(key);
      else if (evt.key === "Enter" && el.riddlesNextBtn && !el.riddlesNextBtn.classList.contains("hidden")) nextRiddle();
    }
    if (el.snakeScreen && el.snakeScreen.classList.contains("visible")) {
      if (evt.key === "ArrowUp") { evt.preventDefault(); setSnakeDirection("up"); }
      if (evt.key === "ArrowDown") { evt.preventDefault(); setSnakeDirection("down"); }
      if (evt.key === "ArrowLeft") { evt.preventDefault(); setSnakeDirection("left"); }
      if (evt.key === "ArrowRight") { evt.preventDefault(); setSnakeDirection("right"); }
      if (evt.key === " ") { evt.preventDefault(); toggleSnakePause(); }
    }
    if (key === "L") toggleLang();
  });
}

/* ── Sidebar Navigation ── */
function initSidebar() {
  const hamburger = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const closeBtn = document.getElementById('sidebar-close');
  const navItems = document.querySelectorAll('.nav-item');

  function toggleSidebar() {
    const isOpen = sidebar.classList.contains('open');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
    if (!isOpen && window.SoundManager) SoundManager.play('click');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
  }

  if (hamburger) hamburger.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      closeSidebar();
      handleNavigation(item.dataset.nav);
    });
  });
}

function handleNavigation(section) {
  const screenMap = {
    home: 'start',
    shop: 'shop',
    rewards: 'rewards',
    leaderboard: 'leaderboard',
    achievements: 'achievements',
  };
  const target = screenMap[section];
  if (target) {
    showScreen(target);
    if (target === 'shop') renderShopScreen();
    if (target === 'rewards') renderRewardsScreen();
    if (target === 'leaderboard') renderLeaderboard();
    if (target === 'achievements') renderAchievementsScreen();
  }
}

/* ── Shop Screen ── */
function renderShopScreen() {
  const grid = document.getElementById('shop-grid');
  const coinDisplay = document.getElementById('shop-coin-display');
  if (coinDisplay) coinDisplay.textContent = String(state.playerCoins);
  if (window.Shop) Shop.renderShop(grid, 'skins', state.playerCoins);

  // Tab handling
  document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      Shop.renderShop(grid, tab.dataset.shopCat, state.playerCoins);
      attachShopEvents();
    });
  });
  attachShopEvents();
}

function attachShopEvents() {
  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const result = Shop.buy(id, state.playerCoins);
      if (result.success) {
        state.playerCoins -= result.cost;
        savePlayerStats();
        if (window.SoundManager) SoundManager.play('purchase');
        Toast.success(`Purchased ${result.item.name}!`);
        renderShopScreen();
      } else {
        Toast.error(result.error);
      }
    });
  });
  document.querySelectorAll('.equip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Shop.equip(btn.dataset.id);
      if (window.SoundManager) SoundManager.play('click');
      renderShopScreen();
    });
  });
}

/* ── Rewards Screen ── */
function renderRewardsScreen() {
  if (!window.Rewards) return;
  const dailyGrid = document.getElementById('daily-rewards-grid');
  Rewards.renderDailyRewards(dailyGrid);

  const spinCanvas = document.getElementById('spin-wheel-canvas');
  Rewards.drawSpinWheel(spinCanvas);

  // Streak info
  const currentStreak = document.getElementById('current-streak');
  const nextBonus = document.getElementById('next-streak-bonus');
  const streakFill = document.getElementById('streak-fill');
  if (currentStreak) currentStreak.textContent = String(Rewards.getStreak());
  const next = Rewards.getNextStreakBonus();
  if (nextBonus && next) nextBonus.textContent = String(next.streak);
  if (streakFill && next) streakFill.style.width = `${(Rewards.getStreak() / next.streak) * 100}%`;

  // Spin button
  const spinBtn = document.getElementById('spin-btn');
  if (spinBtn) {
    spinBtn.disabled = !Rewards.canSpin();
    spinBtn.textContent = Rewards.canSpin() ? 'SPIN!' : 'Come back tomorrow!';
    spinBtn.onclick = () => {
      const result = Rewards.spin();
      if (result) {
        if (window.SoundManager) SoundManager.play('spin');
        const prize = result.prize;
        addPlayerReward(prize.xp, prize.coins);
        const spinResult = document.getElementById('spin-result');
        if (spinResult) spinResult.textContent = `You won: ${prize.label}!`;
        spinBtn.disabled = true;
        spinBtn.textContent = 'Come back tomorrow!';
        Toast.success(`Spin reward: ${prize.label}`);
      }
    };
  }
}

/* ── Leaderboard ── */
function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;
  
  // Generate sample leaderboard
  const entries = [
    { name: 'You', value: state.playerXp, isPlayer: true },
    { name: 'ProGamer99', value: Math.max(state.playerXp + 500, 2000) },
    { name: 'QuizMaster', value: Math.max(state.playerXp + 300, 1500) },
    { name: 'BrainWave', value: Math.max(state.playerXp - 100, 800) },
    { name: 'SpeedKing', value: Math.max(state.playerXp - 300, 500) },
  ].sort((a, b) => b.value - a.value);

  list.innerHTML = entries.map((entry, idx) => {
    const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
    return `<div class="lb-entry ${entry.isPlayer ? 'glass-subtle' : ''}">
      <span class="lb-rank ${rankClass}">${idx + 1}</span>
      <span class="lb-name">${entry.name}</span>
      <span class="lb-value">${entry.value} XP</span>
    </div>`;
  }).join('');
}

/* ── Achievements Screen ── */
function renderAchievementsScreen() {
  if (!window.Rewards) return;
  const grid = document.getElementById('achievements-grid');
  Rewards.renderAchievements(grid);
}

/* ── Daily Reward Claim ── */
function initDailyReward() {
  const banner = document.getElementById('daily-reward-banner');
  const claimBtn = document.getElementById('claim-daily-btn');
  if (!banner || !claimBtn || !window.Rewards) return;

  const { canClaim } = Rewards.getDailyRewardStatus();
  if (!canClaim) banner.classList.add('hidden');

  claimBtn.addEventListener('click', () => {
    const reward = Rewards.claimDailyReward();
    if (reward) {
      addPlayerReward(reward.xp, reward.coins);
      if (window.SoundManager) SoundManager.play('achievement');
      Toast.success(`Daily reward claimed: +${reward.xp} XP, +${reward.coins} coins!`);
      banner.classList.add('hidden');
    }
  });
}

/* ── Improved Snake Game Over ── */
function showSnakeGameOver() {
  const overlay = document.getElementById('snake-gameover');
  const msg = document.getElementById('snake-gameover-msg');
  const finalScore = document.getElementById('snake-final-score');
  const replayBtn = document.getElementById('snake-replay-btn');
  if (overlay) overlay.classList.remove('hidden');
  if (msg) msg.textContent = state.lang === 'ar' ? 'لقد خسرت، حاول مرة أخرى' : 'You lost! Try again';
  if (finalScore) finalScore.textContent = String(snake.score);
  if (replayBtn) {
    replayBtn.onclick = () => {
      overlay.classList.add('hidden');
      startSnake();
    };
  }
  if (window.SoundManager) SoundManager.play('gameOver');
}

/* ── Particle Background ── */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const PARTICLE_COUNT = 40;
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.3 + 0.1,
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 168, 255, ${p.alpha})`;
      ctx.fill();
    });
    
    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(74, 168, 255, ${0.05 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

/* ── Updated showScreen to include new screens ── */
const originalShowScreen = showScreen;
showScreen = function(which) {
  if (which !== "quiz") stopQuizTimer();
  if (which !== "snake") stopSnake();
  if (which !== "matching") stopMatchingTimer();
  if (which !== "riddles") stopRiddleTimer();
  if (which !== "flappy" && window.FlappyGame) FlappyGame.destroy();
  if (which !== "math" && window.MathGame) MathGame.destroy();
  if (which !== "runner" && window.RunnerGame) RunnerGame.destroy();

  const allScreens = document.querySelectorAll('.screen');
  allScreens.forEach(s => s.classList.remove('visible'));

  const screenMap = {
    start: 'start-screen', quiz: 'quiz-screen',
    tictactoe: 'tictactoe-screen', puzzle: 'puzzle-screen',
    snake: 'snake-screen', matching: 'matching-screen', riddles: 'riddles-screen',
    finish: 'finish-screen', stageComplete: 'stage-complete-screen',
    flappy: 'flappy-screen', math: 'math-screen', runner: 'runner-screen',
    shop: 'shop-screen', rewards: 'rewards-screen',
    leaderboard: 'leaderboard-screen', achievements: 'achievements-screen',
  };

  const target = document.getElementById(screenMap[which]);
  if (target) target.classList.add('visible');
};

/* ── Update sidebar stats ── */
function updateSidebarStats() {
  const sLevel = document.getElementById('sidebar-level');
  const sCoins = document.getElementById('sidebar-coins');
  const sXp = document.getElementById('sidebar-xp');
  const sStreak = document.getElementById('sidebar-streak');
  if (sLevel) sLevel.textContent = String(state.playerLevel);
  if (sCoins) sCoins.textContent = String(state.playerCoins);
  if (sXp) sXp.textContent = String(state.playerXp);
  if (sStreak && window.Rewards) sStreak.textContent = String(Rewards.getStreak());
}

/* ── Check achievements after rewards ── */
const originalAddPlayerReward = addPlayerReward;
addPlayerReward = function(xp, coins) {
  const result = originalAddPlayerReward(xp, coins);
  updateSidebarStats();
  
  if (window.Rewards) {
    const stats = {
      gamesWon: parseInt(localStorage.getItem('GameZone:gamesWon') || '0', 10),
      quizStage: state.stage,
      totalCoins: state.playerCoins,
      maxStreak: Rewards.getMaxStreak(),
      level: state.playerLevel,
      gamesPlayed: parseInt(localStorage.getItem('GameZone:gamesPlayed') || '0', 10),
      snakeBest: parseInt(localStorage.getItem('GameZone:snakeBest') || '0', 10),
      memoryHardWin: localStorage.getItem('GameZone:memoryHardWin') === '1',
      mathBest: parseInt(localStorage.getItem('GameZone:mathBest') || '0', 10),
      loginDays: parseInt(localStorage.getItem('GameZone:loginDays') || '0', 10),
      totalXp: state.playerXp + state.playerLevel * 200,
      riddlesSolved: parseInt(localStorage.getItem('GameZone:riddlesSolved') || '0', 10),
    };
    const newAch = Rewards.checkAchievements(stats);
    newAch.forEach(ach => {
      if (window.SoundManager) SoundManager.play('achievement');
      showNotification(ach.icon, `Achievement Unlocked!`, ach.name);
    });
  }
  
  return result;
};

/* ── Notification popup ── */
function showNotification(icon, title, desc) {
  const container = document.getElementById('notification-container');
  if (!container) return;
  const popup = document.createElement('div');
  popup.className = 'notification-popup';
  popup.innerHTML = `<span class="notif-icon">${icon}</span><p class="notif-title">${title}</p><p class="notif-desc">${desc}</p>`;
  container.appendChild(popup);
  setTimeout(() => {
    popup.style.opacity = '0';
    popup.style.transform = 'scale(0.8)';
    popup.style.transition = 'all 0.3s ease';
    setTimeout(() => popup.remove(), 300);
  }, 3000);
}

/* ── Entry point ── */
document.addEventListener("appReady", e => {
  init(e.detail.user);
});

document.addEventListener("DOMContentLoaded", () => {
  if (!window.firebaseAuth) {
    document.dispatchEvent(new CustomEvent("appReady", { detail: { user: null } }));
  }
  
  // Initialize particles
  initParticles();
  
  // Initialize sidebar
  initSidebar();
  
  // Initialize sound manager
  if (window.SoundManager) SoundManager.initHoverSounds();
  
  // Initialize new games
  if (window.FlappyGame) FlappyGame.setupEvents();
  if (window.MathGame) MathGame.setupEvents();
  if (window.RunnerGame) RunnerGame.setupEvents();
  
  // Initialize daily reward
  initDailyReward();
});

// Sound settings
state.soundOff = localStorage.getItem("soundOff") === "1";
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("volume-toggle");
  if (btn) {
    btn.textContent = state.soundOff ? "\uD83D\uDD07 Sound: OFF" : "\uD83D\uDD0A Sound: ON";
    btn.addEventListener("click", () => {
      state.soundOff = !state.soundOff;
      localStorage.setItem("soundOff", state.soundOff ? "1" : "0");
      btn.textContent = state.soundOff ? "\uD83D\uDD07 Sound: OFF" : "\uD83D\uDD0A Sound: ON";
      if (window.SoundManager) SoundManager.toggleMute();
    });
  }
});
