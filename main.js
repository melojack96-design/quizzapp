const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs   = require('fs');
const http = require('http');
const Database = require('better-sqlite3');

let mainWindow;
let db;
let localServer;
let serverPort;
const PREFERRED_SERVER_PORT = 51737; // fixed port keeps Firebase/localStorage login saved between app restarts

/* ── Resolve database path ────────────────────────────── */
function resolveBundledDbPath() {
  if (app.isPackaged) {
    const unpacked = path.join(process.resourcesPath, 'app.asar.unpacked', 'database.db');
    if (fs.existsSync(unpacked)) return unpacked;
    return path.join(process.resourcesPath, 'database.db');
  }
  return path.join(__dirname, 'database.db');
}

function resolveDbPath() {
  const userDataDir = app.getPath('userData');
  const userDbPath  = path.join(userDataDir, 'database.db');
  if (!fs.existsSync(userDbPath)) {
    const bundled = resolveBundledDbPath();
    try {
      fs.mkdirSync(userDataDir, { recursive: true });
      if (fs.existsSync(bundled)) fs.copyFileSync(bundled, userDbPath);
    } catch (err) {
      console.error('Failed to copy bundled database to userData:', err);
    }
  }
  return userDbPath;
}

function initDb() {
  const dbPath = resolveDbPath();
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      question_en    TEXT NOT NULL,
      question_ar    TEXT NOT NULL,
      A TEXT NOT NULL, B TEXT NOT NULL, C TEXT NOT NULL, D TEXT NOT NULL,
      A_ar TEXT, B_ar TEXT, C_ar TEXT, D_ar TEXT,
      correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
      level          INTEGER NOT NULL
    );
  `);

  // Re-seed if empty or if old schema (≤100 rows = 1 question per level)
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM questions').get();
  if (count <= 100) {
    try {
      db.prepare('DELETE FROM questions').run();
      const seed = require('./scripts/seed.js');
      const n = seed(db);
      console.log(`Seeded SQLite database with ${n} questions for 100 stages.`);
    } catch (err) {
      console.error('Failed to seed database:', err);
    }
  }
}

/* ── Local HTTP server ────────────────────────────────────
   Serves app files from localhost so that Firebase Auth
   popups work correctly (requires HTTP origin, not file://).
   Firebase allows localhost as an authorized domain by default.
──────────────────────────────────────────────────────────── */
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.wav':  'audio/wav',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

function getAppRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar');
  }
  return __dirname;
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    const appRoot = getAppRoot();

    localServer = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';

      const filePath = path.join(appRoot, urlPath);

      // Prevent directory traversal
      if (!filePath.startsWith(appRoot)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      try {
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
      } catch {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(filePath).pipe(res);
    });

    const listenOnPort = (port) => {
      localServer.listen(port, '127.0.0.1', () => {
        serverPort = localServer.address().port;
        console.log(`[Server] http://127.0.0.1:${serverPort}`);
        resolve(serverPort);
      });
    };

    localServer.on('error', (err) => {
      // Keep the port stable so Firebase Auth persistence + localStorage are not lost.
      // If the fixed port is busy, fall back to a random port instead of crashing.
      if (err && err.code === 'EADDRINUSE' && !serverPort) {
        console.warn(`[Server] Port ${PREFERRED_SERVER_PORT} busy, using random port.`);
        localServer.close(() => {
          localServer = http.createServer((req, res) => {
            let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
            if (urlPath === '/') urlPath = '/index.html';
            const filePath = path.join(appRoot, urlPath);
            if (!filePath.startsWith(appRoot)) { res.writeHead(403); res.end('Forbidden'); return; }
            try {
              if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); res.end('Not Found'); return; }
            } catch { res.writeHead(404); res.end('Not Found'); return; }
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
            fs.createReadStream(filePath).pipe(res);
          });
          localServer.listen(0, '127.0.0.1', () => {
            serverPort = localServer.address().port;
            console.log(`[Server] http://127.0.0.1:${serverPort}`);
            resolve(serverPort);
          });
          localServer.on('error', reject);
        });
        return;
      }
      console.error('[Server] Failed to start:', err);
      reject(err);
    });

    listenOnPort(PREFERRED_SERVER_PORT);
  });
}

/* ── Window ───────────────────────────────────────────── */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180, height: 780, minWidth: 900, minHeight: 640,
    backgroundColor: '#0b0f1a',
    title: 'App Quiz',
    icon: path.join(__dirname, 'assets', 'logo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false,
      spellcheck:       false,
      webSecurity:      true,
      partition:        'persist:appquiz',
    }
  });

  Menu.setApplicationMenu(null);

  if (serverPort) {
    mainWindow.loadURL(`http://127.0.0.1:${serverPort}/index.html`);
  } else {
    mainWindow.loadFile('index.html');
  }

  if (process.env.QUIZ_DEVTOOLS === '1') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

/* ── SQLite IPC (fallback when Firestore is unavailable) ── */
ipcMain.handle('quiz:getRandomQuestion', (_event, level) => {
  const lvl = Math.max(1, Math.min(100, Number(level) || 1));
  const row = db
    .prepare('SELECT * FROM questions WHERE level = ? ORDER BY RANDOM() LIMIT 1')
    .get(lvl);
  return row || null;
});

ipcMain.handle('quiz:getMaxLevel', () => {
  const row = db.prepare('SELECT MAX(level) AS max FROM questions').get();
  return row ? row.max || 0 : 0;
});

ipcMain.handle('quiz:getLevelCount', (_event, level) => {
  const lvl = Math.max(1, Math.min(100, Number(level) || 1));
  const row = db.prepare('SELECT COUNT(*) AS count FROM questions WHERE level = ?').get(lvl);
  return row ? row.count : 0;
});

/* ── App lifecycle ────────────────────────────────────── */
app.whenReady().then(async () => {
  initDb();
  try {
    await startLocalServer();
  } catch (err) {
    console.warn('[App] Local server failed, falling back to file:// protocol');
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (db) { try { db.close(); } catch (_) {} }
  if (localServer) { try { localServer.close(); } catch (_) {} }
  if (process.platform !== 'darwin') app.quit();
});

app.on('web-contents-created', (_event, contents) => {
  // Allow Firebase/Google/Facebook auth popup windows
  contents.setWindowOpenHandler(({ url }) => {
    if (
      url.includes('firebaseapp.com/__/auth') ||
      url.includes('.firebaseapp.com') ||
      url.startsWith('https://accounts.google.com') ||
      url.startsWith('https://www.facebook.com') ||
      url.startsWith('http://127.0.0.1')
    ) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    const allowed = [
      'http://127.0.0.1',
      'http://localhost',
      'https://accounts.google.com',
      'https://www.facebook.com',
      'firebaseapp.com',
    ];
    if (!allowed.some(a => url.includes(a))) {
      event.preventDefault();
    }
  });
});
