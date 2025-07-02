// backend/rssFeeds.js
// Exported array of RSS feed sources for news coverage
// Each feed object should have a unique 'id'.
// If you add new feeds, ensure 'id', 'name', 'url', 'category', 'language', and 'country' are present.
// Optional: add 'region' for regional feeds.

/**
 * @typedef {Object} RSSFeed
 * @property {string} id - Unique identifier for the feed
 * @property {string} name - Human-readable name
 * @property {string} url - RSS feed URL
 * @property {string} category - News category (e.g., general, business, technology)
 * @property {string} language - Language code (e.g., 'en', 'hi')
 * @property {string} country - Country code or 'global'
 * @property {string} [region] - Optional region for regional feeds
 */

/**
 * @type {RSSFeed[]}
 */
module.exports = [
  // General International
  { id: 'bbc-news', name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'general', language: 'en', country: 'global' },
  { id: 'cnn-news', name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'general', language: 'en', country: 'global' },
  { id: 'google-news', name: 'Google News India', url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en', category: 'general', language: 'en', country: 'india' },

  // National Indian Media
  { id: 'ndtv-india', name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', category: 'national', language: 'en', country: 'india' },
  { id: 'hindustan-times', name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', category: 'national', language: 'en', country: 'india' },
  { id: 'indian-express', name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/', category: 'national', language: 'en', country: 'india' },

  // Political Perspective Media
  { id: 'opindia', name: 'OpIndia', url: 'https://www.opindia.com/feed/', category: 'politics', language: 'en', country: 'india' },
  { id: 'the-wire', name: 'The Wire', url: 'https://thewire.in/rss', category: 'politics', language: 'en', country: 'india' },
  { id: 'scroll', name: 'Scroll.in', url: 'https://scroll.in/feed', category: 'general', language: 'en', country: 'india' },
  { id: 'republic', name: 'Republic World', url: 'https://www.republicworld.com/rssfeeds/topstories.xml', category: 'politics', language: 'en', country: 'india' },
  { id: 'newslaundry', name: 'Newslaundry', url: 'https://www.newslaundry.com/feed/', category: 'politics', language: 'en', country: 'india' },

  // Business & Finance
  { id: 'reuters-business', name: 'Reuters Business', url: 'https://www.reuters.com/business/feed/', category: 'business', language: 'en', country: 'global' },
  { id: 'moneycontrol', name: 'MoneyControl', url: 'https://www.moneycontrol.com/rss/latestnews.xml', category: 'business', language: 'en', country: 'india' },
  { id: 'business-standard', name: 'Business Standard', url: 'https://www.business-standard.com/rss/latest.rss', category: 'business', language: 'en', country: 'india' },

  // Technology
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology', language: 'en', country: 'global' },
  { id: 'gadgets360', name: 'Gadgets 360', url: 'https://gadgets.ndtv.com/rss/feeds', category: 'technology', language: 'en', country: 'india' },
  { id: 'the-verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'technology', language: 'en', country: 'global' },
  { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'technology', language: 'en', country: 'global' },

  // Health & Science
  { id: 'google-news-health', name: 'Google News Health', url: 'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNR3QwTlRFU0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en', category: 'health', language: 'en', country: 'india' },
  { id: 'google-news-science', name: 'Google News Science', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RjU0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en', category: 'science', language: 'en', country: 'india' },
  { id: 'nature', name: 'Nature', url: 'https://www.nature.com/subjects/science/rss', category: 'science', language: 'en', country: 'global' },
  { id: 'medical-news-today', name: 'Medical News Today', url: 'https://www.medicalnewstoday.com/rss', category: 'health', language: 'en', country: 'global' },

  // Sports & Entertainment
  { id: 'espn', name: 'ESPN India', url: 'https://www.espn.in/espn/rss/news', category: 'sports', language: 'en', country: 'india' },
  { id: 'bollywood-hungama', name: 'Bollywood Hungama', url: 'https://www.bollywoodhungama.com/rss/news.xml', category: 'entertainment', language: 'en', country: 'india' },
  { id: 'espn-global', name: 'ESPN Global', url: 'https://www.espn.com/espn/rss/news', category: 'sports', language: 'en', country: 'global' },
  { id: 'hollywood-reporter', name: 'Hollywood Reporter', url: 'https://www.hollywoodreporter.com/t/rss/feed/', category: 'entertainment', language: 'en', country: 'global' },

  // Regional Language Media
  { id: 'abp-news', name: 'ABP News Hindi', url: 'https://news.abplive.com/news/india/rssfeed.xml', category: 'national', language: 'hi', country: 'india' },
  { id: 'aajtak', name: 'Aaj Tak Hindi', url: 'https://aajtak.intoday.in/rssfeed/homepage.xml', category: 'national', language: 'hi', country: 'india' },
  { id: 'amar-ujala', name: 'Amar Ujala', url: 'https://www.amarujala.com/rss/india-news.xml', category: 'national', language: 'hi', country: 'india' },
  { id: 'malayala-manorama', name: 'Malayala Manorama', url: 'https://www.manoramaonline.com/news/latest-news.rss.html', category: 'general', language: 'ml', country: 'india', region: 'kerala' },
  { id: 'eenadu', name: 'Eenadu', url: 'https://www.eenadu.net/rss/eenadu-home.xml', category: 'general', language: 'te', country: 'india', region: 'telangana' },
  { id: 'dinamalar', name: 'Dinamalar', url: 'https://www.dinamalar.com/rss/latest_news.asp', category: 'general', language: 'ta', country: 'india', region: 'tamil-nadu' },

  // Regional TOI feeds
  { id: 'toi-delhi', name: 'TOI Delhi', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128838597.cms', category: 'general', language: 'en', country: 'india', region: 'delhi' },
  { id: 'toi-mumbai', name: 'TOI Mumbai', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128838584.cms', category: 'general', language: 'en', country: 'india', region: 'maharashtra' },
  { id: 'toi-bengaluru', name: 'TOI Bengaluru', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128833038.cms', category: 'general', language: 'en', country: 'india', region: 'karnataka' },
  { id: 'toi-chennai', name: 'TOI Chennai', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128827925.cms', category: 'general', language: 'en', country: 'india', region: 'tamil-nadu' },
  { id: 'toi-kolkata', name: 'TOI Kolkata', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128830821.cms', category: 'general', language: 'en', country: 'india', region: 'west-bengal' },

  // International Perspective
  { id: 'bbc-world', name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'general', language: 'en', country: 'global' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'general', language: 'en', country: 'global' },
  { id: 'dw', name: 'DW News', url: 'https://rss.dw.com/rdf/rss-en-all', category: 'general', language: 'en', country: 'global' },
  { id: 'abc-news', name: 'ABC News', url: 'https://abcnews.go.com/abcnews/topstories', category: 'general', language: 'en', country: 'global' },
  { id: 'npr', name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml', category: 'general', language: 'en', country: 'global' }
];
