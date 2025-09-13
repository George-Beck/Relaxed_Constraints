export interface Article {
  id: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  category: string;
}

export interface ResearchCategory {
  name: string;
  slug: string;
  description: string;
  articles: Article[];
}