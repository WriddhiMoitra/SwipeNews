import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Article } from '../types/Article';

/**
 * Fetch articles from Firestore based on specified filters.
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
    let q = query(
      collection(db, 'articles'),
      where('language', '==', language),
      where('country', '==', country),
      orderBy('published_at', 'desc')
    );

    if (category) {
      q = query(q, where('category', '==', category));
    }

    const querySnapshot = await getDocs(q);
    const articles: Article[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        url: data.url,
        published_at: data.published_at.toDate(),
        category: data.category,
        country: data.country,
        language: data.language,
        source_id: data.source_id,
        read: data.read,
        saved: data.saved,
        created_at: data.created_at.toDate(),
      });
    });

    return articles;
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
