export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  published_at: Date;
  category: string;
  country: string;
  language: string;
  source_id: string;
  read: boolean;
  saved: boolean;
  created_at: Date;
  imageUrl?: string;
  keywords?: string[];
  engagementScore?: number;
  offline?: boolean;
  downloadedAt?: Date;
  summary?: string; // Add summary field for Gemini summaries
}
