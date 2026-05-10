/**
 * database.js — Firestore & SQLite database operations
 * Handles: question fetching, progress save/load, stages metadata
 */
"use strict";

const Database = (() => {
  /* ── Stage helpers ─────────────────────────────────── */
  function questionsForStage(stage) {
    return Math.min(stage * 10, 100);
  }

  /* ── Fetch questions from Firestore ────────────────── */
  async function fetchQuestionsFromFirestore(stage, limit) {
    if (!navigator.onLine || !window.firebaseDb) return null;
    try {
      const snap = await window.firebaseDb
        .collection("questions")
        .where("level", "==", stage)
        .limit(limit || 100)
        .get();
      if (snap.empty) return null;
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("[DB] Firestore fetch failed:", e.message);
      return null;
    }
  }

  /* ── Fetch a random question from SQLite via IPC ───── */
  async function fetchQuestionFromSQLite(stage, excludeIds) {
    if (!window.quizAPI) return null;
    try {
      // Get a random question; if we already answered some, try multiple times
      const maxAttempts = 10;
      for (let i = 0; i < maxAttempts; i++) {
        const q = await window.quizAPI.getRandomQuestion(stage);
        if (!q) return null;
        if (!excludeIds || !excludeIds.has(q.id)) return q;
      }
      // Fallback: return any question even if repeated
      return await window.quizAPI.getRandomQuestion(stage);
    } catch (e) {
      console.warn("[DB] SQLite fetch failed:", e.message);
      return null;
    }
  }

  /* ── Get a question for a given stage ──────────────── */
  async function getQuestion(stage, excludeIds) {
    const exclude = excludeIds || new Set();

    // 1) Firestore
    const firestoreQuestions = await fetchQuestionsFromFirestore(stage);
    if (firestoreQuestions && firestoreQuestions.length > 0) {
      const available = firestoreQuestions.filter(q => !exclude.has(q.id));
      if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
      }
      // All answered — pick any
      return firestoreQuestions[Math.floor(Math.random() * firestoreQuestions.length)];
    }

    // 2) SQLite fallback (pass excludeIds to avoid repeats)
    const sqliteQ = await fetchQuestionFromSQLite(stage, exclude);
    if (sqliteQ) return sqliteQ;

    // 3) Offline cache
    const cached = JSON.parse(localStorage.getItem("offlineQuestions") || "{}");
    const arr = cached[stage];
    if (arr && arr.length) {
      const available = arr.filter(q => !exclude.has(q.id));
      if (available.length) return available[Math.floor(Math.random() * available.length)];
      return arr[Math.floor(Math.random() * arr.length)];
    }

    return null;
  }

  /* ── Max stages ────────────────────────────────────── */
  async function getMaxStages() {
    if (navigator.onLine && window.firebaseDb) {
      try {
        const snap = await window.firebaseDb.collection("questions")
          .orderBy("level", "desc").limit(1).get();
        if (!snap.empty) return snap.docs[0].data().level || 100;
      } catch (_) {}
    }
    if (window.quizAPI) {
      try { return Number(await window.quizAPI.getMaxLevel()) || 100; } catch (_) {}
    }
    return 100;
  }

  /* ── Save progress to Firestore ────────────────────── */
  async function saveProgress(user, data) {
    if (!user) return;
    try {
      await window.firebaseDb
        .collection("users")
        .doc(user.uid)
        .set({
          stage: data.stage,
          questionIndex: data.questionIndex,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch (e) {
      console.warn("[DB] Cloud save failed:", e.message);
    }
  }

  /* ── Load progress from Firestore ──────────────────── */
  async function loadProgress(user) {
    if (!user) return null;
    try {
      const doc = await window.firebaseDb
        .collection("users")
        .doc(user.uid)
        .get();
      if (!doc.exists) return null;
      const data = doc.data();
      return {
        stage: data.stage || 1,
        questionIndex: data.questionIndex || 0,
      };
    } catch (e) {
      console.warn("[DB] Cloud load failed:", e.message);
      return null;
    }
  }

  /* ── Local progress (localStorage fallback) ────────── */
  function saveLocalProgress(data) {
    localStorage.setItem("AppQuiz:stage", String(data.stage));
    localStorage.setItem("AppQuiz:questionIndex", String(data.questionIndex));
  }

  function loadLocalProgress() {
    const stage = parseInt(localStorage.getItem("AppQuiz:stage") || "1", 10);
    const questionIndex = parseInt(localStorage.getItem("AppQuiz:questionIndex") || "0", 10);
    return { stage, questionIndex };
  }

  function clearLocalProgress() {
    localStorage.removeItem("AppQuiz:stage");
    localStorage.removeItem("AppQuiz:questionIndex");
    localStorage.removeItem("App Quiz:level");
    localStorage.removeItem("App Quiz:lang");
  }

  return {
    questionsForStage,
    getQuestion,
    getMaxStages,
    saveProgress,
    loadProgress,
    saveLocalProgress,
    loadLocalProgress,
    clearLocalProgress,
  };
})();

window.Database = Database;
