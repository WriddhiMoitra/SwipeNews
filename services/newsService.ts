import { Article } from '../types/Article';
import { API_BASE_URL } from '@env';

/**
 * Fetch articles from local Node.js backend based on specified filters.
 * @param language - Language of the articles (default: 'en')
 * @param country - Country of the articles (default: 'india')
 * @param category - Category of the articles (optional)
 * @returns Promise resolving to an array of Article objects
 */
export const fetchArticles = async (
  language: string = 'en',
  country: string = 'india',
  category?: string
): Promise<Article[]> => {
  try {
    const params = new URLSearchParams({ language, country });
    if (category) params.append('category', category);
    // Temporarily hardcode the backend URL for testing
    // Using the provided host machine IP address for iOS simulator/device connectivity
    const res = await fetch(`http://192.168.101.10:4000/articles?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    const articles = await res.json();
    // Convert string dates to Date objects
    return articles.map((a: any) => ({
      ...a,
      published_at: new Date(a.published_at),
      created_at: new Date(a.created_at),
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
};

/**
 * Fetch articles by category.
 * @param category - Category of the articles
 * @param language - Language of the articles (default: 'en')
 * @param country - Country of the articles (default: 'india')
 * @returns Promise resolving to an array of Article objects
 */
export const fetchArticlesByCategory = async (
  category: string,
  language: string = 'en',
  country: string = 'india'
): Promise<Article[]> => {
  return fetchArticles(language, country, category);
};
