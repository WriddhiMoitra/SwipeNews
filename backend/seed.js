// This script seeds the SQLite database with sample articles for development.
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'articles.db'));

// Remove hardcoded sample articles and only run RSS sync
const { syncFeedsWithSummaries } = require('./server');

(async () => {
  console.log('Starting RSS sync and summary generation...');
  await syncFeedsWithSummaries();
  console.log('Done!');
  process.exit(0);
})();

db.close();
console.log('Seeded articles.db with sample data.');
