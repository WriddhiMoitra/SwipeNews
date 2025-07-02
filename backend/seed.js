// This script seeds the SQLite database with sample articles for development.
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'articles.db'));

const articles = [
  {
    title: 'Sample News 1',
    description: 'Description for news 1',
    url: 'https://example.com/news1',
    published_at: new Date().toISOString(),
    category: 'general',
    country: 'india',
    language: 'en',
    source_id: 'source1',
    read: 0,
    saved: 0,
    created_at: new Date().toISOString(),
  },
  {
    title: 'Sample News 2',
    description: 'Description for news 2',
    url: 'https://example.com/news2',
    published_at: new Date().toISOString(),
    category: 'sports',
    country: 'india',
    language: 'en',
    source_id: 'source2',
    read: 0,
    saved: 0,
    created_at: new Date().toISOString(),
  }
];

const insertSql = `INSERT INTO articles (title, description, url, published_at, category, country, language, source_id, read, saved, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

articles.forEach(article => {
  db.run(insertSql, [
    article.title,
    article.description,
    article.url,
    article.published_at,
    article.category,
    article.country,
    article.language,
    article.source_id,
    article.read,
    article.saved,
    article.created_at
  ]);
});

// Optionally: run the real RSS sync with summaries
const { syncFeedsWithSummaries } = require('./server');

(async () => {
  console.log('Starting RSS sync and summary generation...');
  await syncFeedsWithSummaries();
  console.log('Done!');
  process.exit(0);
})();

db.close();
console.log('Seeded articles.db with sample data.');
