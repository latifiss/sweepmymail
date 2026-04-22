export interface Article {
    _id: string;
    title: string;
    content: string;
    source_name: string;
    category: string;
    image_url?: string;
    isLive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ArticleInput {
    title: string;
    content: string;
    source_name: string;
    category: string;
    image_url?: File | string;
    isLive?: boolean;
  }
  