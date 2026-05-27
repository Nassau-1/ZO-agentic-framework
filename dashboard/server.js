/**
 * server.js — ZO WIP Dashboard v2
 * HTTP + SSE server: serves static files, parses WIP markdown, watches for changes.
 * Usage: node server.js [--port 4242] [--repos-root "C:\path\to\01_Repos"]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execSync } = require('child_process');
const chokidar = require('chokidar');

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '4242', 10);
const REPOS_ROOT = process.env.REPOS_ROOT ||
  path.resolve(__dirname, '../../');   // Resolves to 01_Repos/

const STATIC_DIR = __dirname;
const PARSE_SCRIPT = path.join(__dirname, 'parse.js');
const DATA_FILE = path.join(__dirname, 'data.json');

// ─── MIME types ───────────────────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
};

// ─── SSE clients ─────────────────────────────────────────────────────────────

let sseClients = [];

function pushReload() {
  const dead = [];
  for (const res of sseClients) {
    try {
      res.write('data: {"event":"reload"}\n\n');
    } catch {
      dead.push(res);
    }
  }
  sseClients = sseClients.filter(r => !dead.includes(r));
  console.log(`[SSE] Pushed reload to ${sseClients.length} client(s)`);
}

// ─── File watcher ─────────────────────────────────────────────────────────────

let debounceTimer = null;

function startWatcher() {
  // Watch all WIP markdown files across all repos
  const watchGlob = path.join(REPOS_ROOT, '*/WIP/**/*.md').replace(/\\/g, '/');
  console.log(`[WATCH] Watching: ${watchGlob}`);

  const watcher = chokidar.watch(watchGlob, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  const trigger = (filepath) => {
    console.log(`[WATCH] Changed: ${path.relative(REPOS_ROOT, filepath)}`);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runParse();
      pushReload();
    }, 500);
  };

  watcher.on('add', trigger).on('change', trigger).on('unlink', trigger);
  watcher.on('error', err => console.error('[WATCH] Error:', err));
}

// ─── Parse runner ─────────────────────────────────────────────────────────────

function runParse() {
  try {
    console.log('[PARSE] Running...');
    execSync(`node "${PARSE_SCRIPT}" --repos-root "${REPOS_ROOT}"`, {
      cwd: __dirname,
      timeout: 30000,
      stdio: 'inherit',
    });
    console.log('[PARSE] Done.');
  } catch (err) {
    console.error('[PARSE] Error:', err.message);
  }
}

// ─── HTTP server ──────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── SSE endpoint ──────────────────────────────────────────────────────────
  if (pathname === '/api/watch') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('data: {"event":"connected"}\n\n');
    sseClients.push(res);
    console.log(`[SSE] Client connected (total: ${sseClients.length})`);

    // Heartbeat every 25s to keep connection alive
    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch { clearInterval(heartbeat); }
    }, 25000);

    req.on('close', () => {
      sseClients = sseClients.filter(r => r !== res);
      clearInterval(heartbeat);
      console.log(`[SSE] Client disconnected (total: ${sseClients.length})`);
    });
    return;
  }

  // ── Data endpoint ─────────────────────────────────────────────────────────
  if (pathname === '/api/data') {
    runParse();
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'data.json not found — parse failed' }));
    }
    return;
  }

  // ── Static files ──────────────────────────────────────────────────────────
  let filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);
  // Safety check: don't serve files outside static dir
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') { res.writeHead(404); res.end('Not found'); }
      else { res.writeHead(500); res.end('Server error'); }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

console.log(`\n╔═══════════════════════════════════════════╗`);
console.log(`║  ZO WIP Dashboard v2                      ║`);
console.log(`╚═══════════════════════════════════════════╝`);
console.log(`  Repos root : ${REPOS_ROOT}`);
console.log(`  Port       : ${PORT}`);

// Initial parse
runParse();

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ✓ Listening at http://localhost:${PORT}\n`);
  startWatcher();
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ✗ Port ${PORT} is already in use. Set PORT env var to use a different port.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
