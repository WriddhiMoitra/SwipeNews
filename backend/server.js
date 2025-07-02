// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Parser = require('rss-parser');
const { getGeminiAnswer } = require('./geminiRag');
const RSS_FEEDS = require('./rssFeeds');
const cron = require('node-cron');

const app = express();
const PORT = 4000;

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'articles.db'), (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create articles table if it doesn't exist
const createTable = `CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  url TEXT,
  published_at TEXT,
  category TEXT,
  country TEXT,
  language TEXT,
  source_id TEXT,
  read INTEGER,
  saved INTEGER,
  created_at TEXT,
  summary TEXT
)`;
db.run(createTable);

// Add summary column if not exists
const addSummaryColumn = `ALTER TABLE articles ADD COLUMN summary TEXT`;
db.run(addSummaryColumn, (err) => {
  if (err && !err.message.includes('duplicate')) {
    // Ignore duplicate column error
    console.error('Error adding summary column:', err.message);
  }
});

// Precompute summaries during RSS sync
global.syncFeedsWithSummaries = async function syncFeedsWithSummaries() {
  const parser = new Parser();
  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items.slice(0, 10)) {
        const url = item.link || item.guid;
        const title = item.title || '';
        const description = item.contentSnippet || item.content || item.summary || '';
        const published_at = item.pubDate || new Date().toISOString();
        const created_at = new Date().toISOString();
        // Check if article already exists
        db.get('SELECT id, summary FROM articles WHERE url = ?', [url], async (err, row) => {
          if (err) return;
          if (!row) {
            // Generate summary using Gemini
            let summary = '';
            try {
              summary = await getGeminiAnswer('Summarize this news article in under 100 words.', `${title}. ${description}`);
              if (!summary) {
                summary = description.slice(0, 300) + (description.length > 300 ? '...' : '');
              }
            } catch (e) {
              summary = description.slice(0, 300) + (description.length > 300 ? '...' : '');
            }
            db.run(
              `INSERT INTO articles (title, description, url, published_at, category, country, language, source_id, read, saved, created_at, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
              [title, description, url, published_at, feed.category, feed.country, feed.language, feed.id, created_at, summary]
            );
          } else if (!row.summary) {
            // If article exists but summary is missing, update it
            let summary = '';
            try {
              summary = await getGeminiAnswer('Summarize this news article in under 100 words.', `${title}. ${description}`);
              if (!summary) {
                summary = description.slice(0, 300) + (description.length > 300 ? '...' : '');
              }
            } catch (e) {
              summary = description.slice(0, 300) + (description.length > 300 ? '...' : '');
            }
            db.run('UPDATE articles SET summary = ? WHERE url = ?', [summary, url]);
          }
        });
      }
    } catch (e) {
      console.error(`Failed to sync ${feed.name}:`, e.message);
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// GET /articles endpoint with filters
app.get('/articles', (req, res) => {
  const { language = 'en', country = 'india', category } = req.query;
  let sql = 'SELECT * FROM articles WHERE language = ? AND country = ?';
  const params = [language, country];
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  sql += ' ORDER BY published_at DESC';
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Always include summary in the response
      res.json(rows.map(a => ({ ...a, summary: a.summary })));
    }
  });
});

// (Optional) POST /articles to add new articles
app.post('/articles', (req, res) => {
  const { title, description, url, published_at, category, country, language, source_id, read, saved, created_at } = req.body;
  const sql = `INSERT INTO articles (title, description, url, published_at, category, country, language, source_id, read, saved, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [title, description, url, published_at, category, country, language, source_id, read ? 1 : 0, saved ? 1 : 0, created_at], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

// RAG endpoint: POST /rag
app.post('/rag', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  // Retrieve top 5 relevant articles (simple LIKE match)
  db.all(
    `SELECT * FROM articles WHERE title LIKE ? OR description LIKE ? ORDER BY published_at DESC LIMIT 5`,
    [`%${query}%`, `%${query}%`],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const context = rows.map(a => `${a.title}: ${a.description}`).join('\n');
      try {
        const answer = await getGeminiAnswer(query, context);
        res.json({ answer, context: rows });
      } catch (e) {
        res.status(500).json({ error: 'Gemini API error', details: e.message });
      }
    }
  );
});

// Summarize endpoint: POST /summarize
app.post('/summarize', async (req, res) => {
  const { title, description } = req.body;
  if (!title && !description) {
    return res.status(400).json({ error: 'Title or description required' });
  }
  const content = `${title ? title + '. ' : ''}${description || ''}`;
  const prompt = `Summarize the following news article in under 100 words, focusing on the key facts and main point.\n\n${content}`;
  try {
    const summary = await getGeminiAnswer('Summarize this news article in under 100 words.', content);
    res.json({ summary });
  } catch (e) {
    res.status(500).json({ error: 'Gemini API error', details: e.message });
  }
});

// Schedule RSS sync and summary generation every 30 minutes
db.serialize(() => {
  cron.schedule('*/30 * * * *', () => {
    console.log('Running scheduled RSS sync and summary generation...');
    require('./syncFeeds');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export sync function for manual/cron use
module.exports = { syncFeedsWithSummaries };
