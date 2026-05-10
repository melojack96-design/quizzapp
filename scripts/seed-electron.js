/*
 * Electron-driven seeder: builds a fresh `database.db` in the project root and
 * exits. Run with: `npx electron scripts/seed-electron.js`
 * This is useful because `better-sqlite3` is compiled against Electron's
 * Node runtime (not the host Node), so seeding from plain `node` will fail.
 */
const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const seed = require("./seed.js");

app.whenReady().then(() => {
  const dbPath = path.join(__dirname, "..", "database.db");
  try {
    fs.rmSync(dbPath, { force: true });
    fs.rmSync(`${dbPath}-wal`, { force: true });
    fs.rmSync(`${dbPath}-shm`, { force: true });
  } catch (_) { /* ignore */ }

  const db = new Database(dbPath);
  // Use DELETE journal so the single database.db file is self-contained after close.
  db.pragma("journal_mode = DELETE");
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_en TEXT NOT NULL,
      question_ar TEXT NOT NULL,
      A TEXT NOT NULL,
      B TEXT NOT NULL,
      C TEXT NOT NULL,
      D TEXT NOT NULL,
      A_ar TEXT,
      B_ar TEXT,
      C_ar TEXT,
      D_ar TEXT,
      correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
      level INTEGER NOT NULL
    );
  `);
  const n = seed(db);
  const count = db.prepare("SELECT COUNT(*) AS c FROM questions").get().c;
  console.log(`Seeded ${n} rows (verified ${count}) into ${dbPath}`);
  db.close();
  app.exit(0);
});
