export interface NewsSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
  region?: string;
  last_synced?: string;
  active?: boolean;
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  { 
    id: 'general', 
    name: 'General', 
    description: 'General news from various topics',
    color: '#6B7280',
    icon: 'globe'
  },
  { 
    id: 'business', 
    name: 'Business', 
    description: 'News about business, finance, and economy',
    color: '#10B981',
    icon: 'trending-up'
  },
  { 
    id: 'technology', 
    name: 'Technology', 
    description: 'Latest updates in technology and innovation',
    color: '#3B82F6',
    icon: 'cpu'
  },
  { 
    id: 'science', 
    name: 'Science', 
    description: 'Scientific discoveries and research',
    color: '#8B5CF6',
    icon: 'zap'
  },
  { 
    id: 'sports', 
    name: 'Sports', 
    description: 'Sports news and updates',
    color: '#F59E0B',
    icon: 'activity'
  },
  { 
    id: 'entertainment', 
    name: 'Entertainment', 
    description: 'News from the entertainment industry',
    color: '#EF4444',
    icon: 'film'
  },
  { 
    id: 'health', 
    name: 'Health', 
    description: 'Health and medical news',
    color: '#06B6D4',
    icon: 'heart'
  },
  { 
    id: 'politics', 
    name: 'Politics', 
    description: 'Political news and analysis',
    color: '#DC2626',
    icon: 'flag'
  },
];

export const getCategoryById = (id: string): NewsCategory | undefined => {
  return NEWS_CATEGORIES.find(category => category.id === id);
};

export const getNewsSources = async (language?: string, country?: string): Promise<NewsSource[]> => {
  // Comprehensive list of news sources
  const allSources: NewsSource[] = [
    // General News
    {
      id: 'bbc-news',
      name: 'BBC News',
      description: 'BBC News provides trusted World and UK news as well as local and regional perspectives.',
      url: 'https://www.bbc.co.uk/news',
      category: 'general',
      language: 'en',
      country: 'gb',
      region: 'Europe',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'the-guardian-uk',
      name: 'The Guardian',
      description: 'Latest news, sport, business, comment, analysis and reviews from the Guardian, the world\'s leading liberal voice.',
      url: 'https://www.theguardian.com/uk',
      category: 'general',
      language: 'en',
      country: 'gb',
      region: 'Europe',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'cnn',
      name: 'CNN',
      description: 'CNN operates as a division of Turner Broadcasting System, which is a subsidiary of Warner Media.',
      url: 'https://www.cnn.com',
      category: 'general',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'reuters',
      name: 'Reuters',
      description: 'Reuters.com brings you the latest news from around the world, covering breaking news in business, politics, entertainment, technology, video and pictures.',
      url: 'https://www.reuters.com',
      category: 'general',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'times-of-india',
      name: 'The Times of India',
      description: 'Times of India brings the Latest News and Top Breaking headlines on Politics and Current Affairs in India and around the World.',
      url: 'https://timesofindia.indiatimes.com',
      category: 'general',
      language: 'en',
      country: 'in',
      region: 'South Asia',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'hindustan-times',
      name: 'Hindustan Times',
      description: 'Read latest news, breaking news and current affairs from India and World including politics, sports, business and entertainment.',
      url: 'https://www.hindustantimes.com',
      category: 'general',
      language: 'en',
      country: 'in',
      region: 'South Asia',
      last_synced: new Date().toISOString(),
      active: true,
    },
    
    // Technology
    {
      id: 'techcrunch',
      name: 'TechCrunch',
      description: 'TechCrunch is a leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news.',
      url: 'https://techcrunch.com',
      category: 'technology',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'the-verge',
      name: 'The Verge',
      description: 'The Verge covers the intersection of technology, science, art, and culture.',
      url: 'https://www.theverge.com',
      category: 'technology',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'wired',
      name: 'Wired',
      description: 'Wired is a monthly American magazine, published in print and online editions, that focuses on how emerging technologies affect culture, the economy, and politics.',
      url: 'https://www.wired.com',
      category: 'technology',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    
    // Business
    {
      id: 'bloomberg',
      name: 'Bloomberg',
      description: 'Bloomberg delivers business and markets news, data, analysis, and video to the world.',
      url: 'https://www.bloomberg.com',
      category: 'business',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'financial-times',
      name: 'Financial Times',
      description: 'News, analysis and comment from the Financial Times, the world\'s leading global business publication.',
      url: 'https://www.ft.com',
      category: 'business',
      language: 'en',
      country: 'gb',
      region: 'Europe',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'economic-times',
      name: 'The Economic Times',
      description: 'Get latest Economy online at economictimes.indiatimes.com. Read Breaking News on Economy updated and published at The Economic Times.',
      url: 'https://economictimes.indiatimes.com',
      category: 'business',
      language: 'en',
      country: 'in',
      region: 'South Asia',
      last_synced: new Date().toISOString(),
      active: true,
    },
    
    // Sports
    {
      id: 'espn',
      name: 'ESPN',
      description: 'ESPN.com provides comprehensive sports coverage. Complete sports information including NFL, MLB, NBA, College Football, College Basketball scores and news.',
      url: 'https://www.espn.com',
      category: 'sports',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'bbc-sport',
      name: 'BBC Sport',
      description: 'Visit BBC Sport for live scores, fixtures, latest news, results, league tables, video highlights and more from all the major sports.',
      url: 'https://www.bbc.com/sport',
      category: 'sports',
      language: 'en',
      country: 'gb',
      region: 'Europe',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'espn-cricinfo',
      name: 'ESPN Cricinfo',
      description: 'Live cricket scores, recent matches, schedules, results, videos, photos, team news for international, domestic and T20 cricket.',
      url: 'https://www.espncricinfo.com',
      category: 'sports',
      language: 'en',
      country: 'in',
      region: 'South Asia',
      last_synced: new Date().toISOString(),
      active: true,
    },
    
    // Entertainment
    {
      id: 'entertainment-weekly',
      name: 'Entertainment Weekly',
      description: 'Entertainment Weekly brings you the latest entertainment news, celebrity interviews, movie reviews, TV show recaps, and more.',
      url: 'https://ew.com',
      category: 'entertainment',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'variety',
      name: 'Variety',
      description: 'Variety is the most authoritative and trusted source for entertainment industry news.',
      url: 'https://variety.com',
      category: 'entertainment',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    
    // Health
    {
      id: 'medical-news-today',
      name: 'Medical News Today',
      description: 'Medical News Today provides breaking medical news and the latest medical information, research and health news.',
      url: 'https://www.medicalnewstoday.com',
      category: 'health',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'webmd',
      name: 'WebMD',
      description: 'WebMD provides valuable health information, tools for managing your health, and support to those who seek information.',
      url: 'https://www.webmd.com',
      category: 'health',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    
    // Science
    {
      id: 'national-geographic',
      name: 'National Geographic',
      description: 'National Geographic stories take you on a journey that\'s always enlightening, often surprising, and unfailingly fascinating.',
      url: 'https://www.nationalgeographic.com',
      category: 'science',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'new-scientist',
      name: 'New Scientist',
      description: 'Science news and science articles from New Scientist.',
      url: 'https://www.newscientist.com',
      category: 'science',
      language: 'en',
      country: 'gb',
      region: 'Europe',
      last_synced: new Date().toISOString(),
      active: true,
    },
    
    // Politics
    {
      id: 'politico',
      name: 'Politico',
      description: 'POLITICO covers political news with a focus on national politics, Congress, Capitol Hill, the 2024 presidential race, lobbying, advocacy, and more.',
      url: 'https://www.politico.com',
      category: 'politics',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
    {
      id: 'the-hill',
      name: 'The Hill',
      description: 'The Hill is a top US political website, read by the White House and more lawmakers than any other site.',
      url: 'https://thehill.com',
      category: 'politics',
      language: 'en',
      country: 'us',
      region: 'North America',
      last_synced: new Date().toISOString(),
      active: true,
    },
  ];

  // Filter by language and country if specified
  let filteredSources = allSources;
  
  if (language) {
    filteredSources = filteredSources.filter(source => source.language === language);
  }
  
  if (country) {
    filteredSources = filteredSources.filter(source => source.country === country);
  }
  
  return filteredSources;
};

// Alias for backward compatibility
export const fetchNewsSources = getNewsSources;

export const getNewsSourcesByCategory = async (categoryId: string, language?: string, country?: string): Promise<NewsSource[]> => {
  const sources = await getNewsSources(language, country);
  return sources.filter(source => source.category === categoryId);
};

export const getSourcesGroupedByCategory = async (language?: string, country?: string): Promise<{ [category: string]: NewsSource[] }> => {
  const sources = await getNewsSources(language, country);
  const grouped: { [category: string]: NewsSource[] } = {};
  
  // Initialize all categories
  NEWS_CATEGORIES.forEach(category => {
    grouped[category.id] = [];
  });
  
  // Group sources by category
  sources.forEach(source => {
    if (grouped[source.category]) {
      grouped[source.category].push(source);
    }
  });
  
  return grouped;
};

export const toggleSourceSelection = async (sourceId: string, selected: boolean): Promise<void> => {
  // Placeholder for toggling source selection in user preferences
  console.log(`Source ${sourceId} ${selected ? 'selected' : 'deselected'}`);
};
