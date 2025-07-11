import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineArticle } from '../types/Gamification';
import { Article } from '../types/Article';

const OFFLINE_ARTICLES_KEY = 'offline_articles';
const OFFLINE_IMAGES_DIR = `${FileSystem.documentDirectory}offline_images/`;

export class OfflineDownloadService {
  private static instance: OfflineDownloadService;

  static getInstance(): OfflineDownloadService {
    if (!OfflineDownloadService.instance) {
      OfflineDownloadService.instance = new OfflineDownloadService();
    }
    return OfflineDownloadService.instance;
  }

  async initializeOfflineStorage(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(OFFLINE_IMAGES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(OFFLINE_IMAGES_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error initializing offline storage:', error);
    }
  }

  async downloadArticle(article: Article): Promise<OfflineArticle> {
    try {
      await this.initializeOfflineStorage();

      // Download images if any
      const downloadedImages: string[] = [];
      if (article.urlToImage) {
        try {
          const imageExtension = article.urlToImage.split('.').pop()?.split('?')[0] || 'jpg';
          const localImagePath = `${OFFLINE_IMAGES_DIR}${article.id}.${imageExtension}`;
          
          const downloadResult = await FileSystem.downloadAsync(article.urlToImage, localImagePath);
          if (downloadResult.status === 200) {
            downloadedImages.push(localImagePath);
          }
        } catch (imageError) {
          console.warn('Failed to download image for article:', article.id, imageError);
        }
      }

      // Create offline article object
      const offlineArticle: OfflineArticle = {
        id: article.id,
        article: {
          ...article,
          offline: true,
          localImagePath: downloadedImages[0] || undefined
        },
        downloadedAt: new Date(),
        fileSize: this.calculateArticleSize(article) + downloadedImages.length * 500000, // Estimate
        isDownloaded: true,
        images: downloadedImages
      };

      // Save to storage
      await this.saveOfflineArticle(offlineArticle);
      
      return offlineArticle;
    } catch (error) {
      console.error('Error downloading article:', error);
      throw error;
    }
  }

  private calculateArticleSize(article: Article): number {
    // Rough estimate of article size in bytes
    const textSize = (article.title?.length || 0) + (article.description?.length || 0) + (article.content?.length || 0);
    return textSize * 2; // UTF-8 encoding estimate
  }

  async saveOfflineArticle(offlineArticle: OfflineArticle): Promise<void> {
    try {
      const existingArticles = await this.getOfflineArticles();
      const updatedArticles = existingArticles.filter(a => a.id !== offlineArticle.id);
      updatedArticles.push(offlineArticle);
      
      await AsyncStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(updatedArticles.map(a => ({
        ...a,
        downloadedAt: a.downloadedAt.toISOString()
      }))));
    } catch (error) {
      console.error('Error saving offline article:', error);
    }
  }

  async getOfflineArticles(): Promise<OfflineArticle[]> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_ARTICLES_KEY);
      if (stored) {
        const articles = JSON.parse(stored);
        return articles.map((a: any) => ({
          ...a,
          downloadedAt: new Date(a.downloadedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting offline articles:', error);
      return [];
    }
  }

  async getOfflineArticle(articleId: string): Promise<OfflineArticle | null> {
    try {
      const articles = await this.getOfflineArticles();
      return articles.find(a => a.id === articleId) || null;
    } catch (error) {
      console.error('Error getting offline article:', error);
      return null;
    }
  }

  async isArticleDownloaded(articleId: string): Promise<boolean> {
    try {
      const article = await this.getOfflineArticle(articleId);
      return article?.isDownloaded || false;
    } catch (error) {
      console.error('Error checking if article is downloaded:', error);
      return false;
    }
  }

  async deleteOfflineArticle(articleId: string): Promise<void> {
    try {
      const articles = await this.getOfflineArticles();
      const articleToDelete = articles.find(a => a.id === articleId);
      
      if (articleToDelete) {
        // Delete associated images
        if (articleToDelete.images) {
          for (const imagePath of articleToDelete.images) {
            try {
              await FileSystem.deleteAsync(imagePath);
            } catch (imageError) {
              console.warn('Failed to delete image:', imagePath, imageError);
            }
          }
        }
        
        // Remove from storage
        const updatedArticles = articles.filter(a => a.id !== articleId);
        await AsyncStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(updatedArticles.map(a => ({
          ...a,
          downloadedAt: a.downloadedAt.toISOString()
        }))));
      }
    } catch (error) {
      console.error('Error deleting offline article:', error);
    }
  }

  async getOfflineStorageSize(): Promise<number> {
    try {
      const articles = await this.getOfflineArticles();
      return articles.reduce((total, article) => total + article.fileSize, 0);
    } catch (error) {
      console.error('Error calculating offline storage size:', error);
      return 0;
    }
  }

  async clearAllOfflineArticles(): Promise<void> {
    try {
      const articles = await this.getOfflineArticles();
      
      // Delete all images
      for (const article of articles) {
        if (article.images) {
          for (const imagePath of article.images) {
            try {
              await FileSystem.deleteAsync(imagePath);
            } catch (imageError) {
              console.warn('Failed to delete image:', imagePath, imageError);
            }
          }
        }
      }
      
      // Clear storage
      await AsyncStorage.removeItem(OFFLINE_ARTICLES_KEY);
      
      // Remove offline images directory
      try {
        await FileSystem.deleteAsync(OFFLINE_IMAGES_DIR);
      } catch (dirError) {
        console.warn('Failed to delete offline images directory:', dirError);
      }
    } catch (error) {
      console.error('Error clearing all offline articles:', error);
    }
  }

  async getOfflineArticlesByCategory(category: string): Promise<OfflineArticle[]> {
    try {
      const articles = await this.getOfflineArticles();
      return articles.filter(a => a.article.category === category);
    } catch (error) {
      console.error('Error getting offline articles by category:', error);
      return [];
    }
  }

  async syncOfflineArticles(): Promise<void> {
    try {
      const articles = await this.getOfflineArticles();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Remove articles older than a week
      const articlesToRemove = articles.filter(a => a.downloadedAt < oneWeekAgo);
      
      for (const article of articlesToRemove) {
        await this.deleteOfflineArticle(article.id);
      }
      
      console.log(`Cleaned up ${articlesToRemove.length} old offline articles`);
    } catch (error) {
      console.error('Error syncing offline articles:', error);
    }
  }
}