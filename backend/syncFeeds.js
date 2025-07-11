// backend/syncFeeds.js
// Script to sync RSS feeds, precompute summaries, and update the database automatically

const Parser = require('rss-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { getGeminiAnswer } = require('./geminiRag');
const RSS_FEEDS = require('./rssFeeds');

const db = new sqlite3.Database(path.join(__dirname, 'articles.db'));
const parser = new Parser();

// Ensure summary column exists
const addSummaryColumn = `ALTER TABLE articles ADD COLUMN summary TEXT`;
db.run(addSummaryColumn, (err) => {
  if (err && !err.message.includes('duplicate')) {
    console.error('Error adding summary column:', err.message);
  }
});

async function syncFeedsWithSummaries() {
  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items.slice(0, 10)) {
        const url = item.link || item.guid;
        const title = item.title || '';
        const description = item.contentSnippet || item.content || item.summary || '';
        const published_at = item.pubDate || new Date().toISOString();
        const created_at = new Date().toISOString();
        db.get('SELECT id, summary FROM articles WHERE url = ?', [url], async (err, row) => {
          if (err) return;
          if (!row) {
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

// Run the sync automatically when this script is executed
syncFeedsWithSummaries().then(() => {
  console.log('RSS sync and summary generation complete.');
});
