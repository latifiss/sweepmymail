export interface Feature {
    _id: string;
    title: string;
    label: string;
    description: string;
    content: string;
    venue: string;
    tags: string[];
    rating: number;
    image_url?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface FeatureInput {
    title: string;
    label: string;
    description: string;
    content: string;
    venue: string;
    tags: string;
    rating: number;
    thumbnail?: File | string;
  }