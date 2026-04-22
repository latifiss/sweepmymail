export interface Opinion {
    _id: string;
    title: string;
    description: string;
    content: string;
    meta_title: string;
    meta_description: string;
    tags: string[];
    creator: string;
    image_url?: string;
    published_at: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface OpinionInput {
    title: string;
    description: string;
    content: string;
    meta_title: string;
    meta_description: string;
    tags: string[];
    creator?: string;
    published_at: string;
    thumbnail?: File | string;
  }