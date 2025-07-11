import { Article } from '../types/Article';
import { db } from './firebase';
import { collection, query, where, orderBy, limit, getDocs, QueryConstraint } from 'firebase/firestore';

/**
 * Convert Firestore Timestamp, string, or Date to JavaScript Date object.
 * @param val - Value to convert
 * @returns JavaScript Date object
 */
function toDateSafe(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'string') return new Date(val);
  if (typeof val?.toDate === 'function') return val.toDate();
  return new Date(val);
}

/**
 * Fetch articles from Firebase Firestore based on specified filters.
 * @param language - Language of the articles (default: 'en')
 * @param country - Country of the articles (default: 'india')
 * @param category - Category of the articles (optional)
 * @param limitCount - Maximum number of articles to fetch (default: 50)
 * @returns Promise resolving to an array of Article objects
 */
export const fetchArticles = async (
  language: string = 'en',
  country: string = 'india',
  category?: string,
  limitCount: number = 50
): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, 'articles');
    const constraints: QueryConstraint[] = [
      where('language', '==', language),
      where('country', '==', country),
      orderBy('published_at', 'desc'),
      limit(limitCount)
    ];

    // Add category filter if specified
    if (category) {
      constraints.splice(2, 0, where('category', '==', category));
    }

    const q = query(articlesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const articles: Article[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        url: data.url || '',
        published_at: toDateSafe(data.published_at),
        category: data.category || 'general',
        country: data.country || country,
        language: data.language || language,
        source_id: data.source_id || 'unknown',
        read: data.read || false,
        saved: data.saved || false,
        created_at: toDateSafe(data.created_at),
        imageUrl: data.imageUrl,
        keywords: data.keywords || [],
        engagementScore: data.engagementScore || 0,
        summary: data.summary || data.description || ''
      });
    });

    return articles;
  } catch (error) {
    console.error('Error fetching articles from Firebase:', error);
    return [];
  }
};

/**
 * Fetch articles by category from Firebase.
 * @param category - Category of the articles
 * @param language - Language of the articles (default: 'en')
 * @param country - Country of the articles (default: 'india')
 * @param limitCount - Maximum number of articles to fetch (default: 50)
 * @returns Promise resolving to an array of Article objects
 */
export const fetchArticlesByCategory = async (
  category: string,
  language: string = 'en',
  country: string = 'india',
  limitCount: number = 50
): Promise<Article[]> => {
  return fetchArticles(language, country, category, limitCount);
};

/**
 * Fetch trending articles (articles with high engagement scores)
 * @param language - Language of the articles (default: 'en')
 * @param country - Country of the articles (default: 'india')
 * @param limitCount - Maximum number of articles to fetch (default: 20)
 * @returns Promise resolving to an array of trending Article objects
 */
export const fetchTrendingArticles = async (
  language: string = 'en',
  country: string = 'india',
  limitCount: number = 20
): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(
      articlesRef,
      where('language', '==', language),
      where('country', '==', country),
      orderBy('engagementScore', 'desc'),
      orderBy('published_at', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const articles: Article[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        url: data.url || '',
        published_at: toDateSafe(data.published_at),
        category: data.category || 'general',
        country: data.country || country,
        language: data.language || language,
        source_id: data.source_id || 'unknown',
        read: data.read || false,
        saved: data.saved || false,
        created_at: toDateSafe(data.created_at),
        imageUrl: data.imageUrl,
        keywords: data.keywords || [],
        engagementScore: data.engagementScore || 0,
        summary: data.summary || data.description || ''
      });
    });

    return articles;
  } catch (error) {
    console.error('Error fetching trending articles from Firebase:', error);
    return [];
  }
};

/**
 * Search articles by title or description
 * @param searchTerm - Term to search for
 * @param language - Language of the articles (default: 'en')
 * @param country - Country of the articles (default: 'india')
 * @param limitCount - Maximum number of articles to fetch (default: 30)
 * @returns Promise resolving to an array of matching Article objects
 */
export const searchArticles = async (
  searchTerm: string,
  language: string = 'en',
  country: string = 'india',
  limitCount: number = 30
): Promise<Article[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia or Elasticsearch
    // This is a basic implementation that fetches articles and filters client-side
    
    const articles = await fetchArticles(language, country, undefined, 100);
    const searchTermLower = searchTerm.toLowerCase();
    
    return articles
      .filter(article => 
        article.title.toLowerCase().includes(searchTermLower) ||
        article.description.toLowerCase().includes(searchTermLower) ||
        (article.keywords && article.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTermLower)
        ))
      )
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error searching articles:', error);
    return [];
  }
};