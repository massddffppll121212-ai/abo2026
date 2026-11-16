import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache for generated female voice audio clips
const ttsCache = new Map<string, string>();

// Clean emoji & symbols that cause robotic / awkward speech reading
function sanitizeText(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[⭐✨🎈🎉👏🏆👑🦁🦆🍎🦊🐪🐎🐑🚲🐺🦒🐟☀️🦅🐸✈️✉️🐦🦌🦋🐵📖🍋🍌🐝🦜🌹🖐️💪💡🔍]/g, '')
    .replace(/[()[\]{}«»"']/g, '')
    .trim();
}

// Endpoint for voice helper status and audio cache
app.post('/api/tts', async (req, res) => {
  try {
    const { text, dialect = 'fusha' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const clean = sanitizeText(text);
    if (!clean) {
      return res.status(400).json({ error: 'Empty text after cleaning' });
    }

    const cacheKey = `${dialect}:${clean}`;
    if (ttsCache.has(cacheKey)) {
      return res.json({ audio: ttsCache.get(cacheKey), cached: true });
    }

    // Return clean fallback instruction for native female voice engine
    return res.json({ audio: null, fallback: true });
  } catch {
    return res.json({ audio: null, fallback: true });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Serve prepared app bundle zip directly from workspace root
app.get('/AkramWorld_App_Bundle.zip', (_req, res) => {
  const bundlePath = path.resolve(import.meta.dirname || __dirname, 'AkramWorld_App_Bundle.zip');
  if (fs.existsSync(bundlePath)) {
    return res.download(bundlePath, 'AkramWorld_App_Bundle.zip');
  }
  return res.status(404).json({ error: 'Bundle not found' });
});

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
