import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { Article } from '../types/Article';
import { fetchArticles } from '../services/newsService';
import { PersonalizedNewsService } from '../services/personalizedNewsService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme } from './ThemeContext';

type FeedState = {
  articles: Article[];
  savedArticles: string[];
  readArticles: string[];
  currentCategory: string | null;
  isLoading: boolean;
  error: string | null;
};

type FeedAction =
  | { type: 'SET_ARTICLES'; payload: Article[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'TOGGLE_SAVE_ARTICLE'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string };

const initialState: FeedState = {
  articles: [],
  savedArticles: [],
  readArticles: [],
  currentCategory: null,
  isLoading: false,
  error: null,
};

const feedReducer = (state: FeedState, action: FeedAction): FeedState => {
  switch (action.type) {
    case 'SET_ARTICLES':
      return { ...state, articles: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CATEGORY':
      return { ...state, currentCategory: action.payload };
    case 'TOGGLE_SAVE_ARTICLE': {
      const articleId = action.payload;
      const isSaved = state.savedArticles.includes(articleId);
      return {
        ...state,
        savedArticles: isSaved
          ? state.savedArticles.filter(id => id !== articleId)
          : [...state.savedArticles, articleId],
      };
    }
    case 'MARK_AS_READ':
      return {
        ...state,
        readArticles: state.readArticles.includes(action.payload)
          ? state.readArticles
          : [...state.readArticles, action.payload],
      };
    default:
      return state;
  }
};

interface FeedContextType {
  state: FeedState;
  dispatch: React.Dispatch<FeedAction>;
  refreshFeed: () => Promise<void>;
  setCategory: (category: string | null) => void;
  toggleSaveArticle: (articleId: string) => void;
  markAsRead: (articleId: string) => void;
}

const FeedContext = createContext<FeedContextType>({
  state: initialState,
  dispatch: () => {},
  refreshFeed: async () => {},
  setCategory: () => {},
  toggleSaveArticle: () => {},
  markAsRead: () => {},
});

export const FeedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(feedReducer, initialState);
  const [userRegion, setUserRegion] = useState<string>('india');
  const [userLanguage, setUserLanguage] = useState<string>('en');
  const [personalizedNewsService] = useState(() => PersonalizedNewsService.getInstance());
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;
        if (user && user.uid) {
          const userPrefDoc = await getDoc(doc(db, 'userPreferences', user.uid));
          if (userPrefDoc.exists()) {
            const data = userPrefDoc.data();
            setUserRegion(data.region || 'india');
            setUserLanguage(data.language || 'en');
          }
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    fetchUserPreferences();
  }, []);

  const refreshFeed = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      let articles: Article[] = [];

      if (user && user.uid && !user.isAnonymous) {
        // Use personalized feed for authenticated users
        if (state.currentCategory) {
          // If specific category is selected, fetch that category with personalization
          articles = await personalizedNewsService.fetchPersonalizedArticles(
            user.uid,
            userLanguage,
            userRegion,
            state.currentCategory,
            50
          );
        } else {
          // Fetch fully personalized feed
          articles = await personalizedNewsService.fetchPersonalizedArticles(
            user.uid,
            userLanguage,
            userRegion,
            undefined,
            50
          );
        }
      } else {
        // For anonymous users or when personalization fails, use balanced feed
        if (state.currentCategory) {
          articles = await fetchArticles(userLanguage, userRegion, state.currentCategory);
        } else {
          articles = await personalizedNewsService.fetchBalancedFeedForNewUser(
            userLanguage,
            userRegion,
            30
          );
        }
      }

      dispatch({ type: 'SET_ARTICLES', payload: articles });
    } catch (err) {
      console.error('Error refreshing feed:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load articles' });
    }
  };

  const setCategory = (category: string | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const toggleSaveArticle = async (articleId: string) => {
    dispatch({ type: 'TOGGLE_SAVE_ARTICLE', payload: articleId });
    
    // Auto-download for offline when saving
    try {
      const article = state.articles.find(a => a.id === articleId);
      if (article && !state.savedArticles.includes(articleId)) {
        // Article is being saved, download it for offline
        const { OfflineDownloadService } = await import('../services/offlineDownloadService');
        const offlineService = OfflineDownloadService.getInstance();
        
        // Check if already downloaded
        const isDownloaded = await offlineService.isArticleDownloaded(articleId);
        if (!isDownloaded) {
          await offlineService.downloadArticle(article);
          console.log('Article auto-downloaded for offline reading');
        }
      }
    } catch (error) {
      console.error('Error auto-downloading article:', error);
      // Don't show error to user, offline download is optional
    }
  };

  const markAsRead = (articleId: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: articleId });
  };

  useEffect(() => {
    refreshFeed();
  }, [state.currentCategory, theme]);

  return (
    <FeedContext.Provider value={{ state, dispatch, refreshFeed, setCategory, toggleSaveArticle, markAsRead }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => useContext(FeedContext);
