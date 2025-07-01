import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { Article } from '../types/Article';
import { fetchArticles } from '../services/newsService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

  useEffect(() => {
    const fetchUserPreferences = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;
      if (user) {
        const userPrefDoc = await getDoc(doc(db, 'userPreferences', user.uid));
        if (userPrefDoc.exists()) {
          const data = userPrefDoc.data();
          setUserRegion(data.region || 'india');
          setUserLanguage(data.language || 'en');
        }
      }
    };
    fetchUserPreferences();
  }, []);

  const refreshFeed = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const articles = await fetchArticles(userLanguage, userRegion, state.currentCategory ?? undefined);
      dispatch({ type: 'SET_ARTICLES', payload: articles });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load articles' });
    }
  };

  const setCategory = (category: string | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const toggleSaveArticle = (articleId: string) => {
    dispatch({ type: 'TOGGLE_SAVE_ARTICLE', payload: articleId });
  };

  const markAsRead = (articleId: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: articleId });
  };

  useEffect(() => {
    refreshFeed();
  }, [state.currentCategory]);

  return (
    <FeedContext.Provider value={{ state, dispatch, refreshFeed, setCategory, toggleSaveArticle, markAsRead }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => useContext(FeedContext);
