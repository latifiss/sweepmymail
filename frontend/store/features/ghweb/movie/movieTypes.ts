export interface Movie {
    _id: string;
    title: string;
    label: string;
    description: string;
    content: string;
    genre: string;
    tags: string[];
    creator: string;
    rating: number;
    releaseYear: number;
    youtube: boolean;
    youtube_url?: string;
    netflix: boolean;
    netflix_url?: string;
    showmax: boolean;
    showmax_url?: string;
    primevideo: boolean;
    primevideo_url?: string;
    irokotv: boolean;
    irokotv_url?: string;
    image_url?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MovieInput {
    title: string;
    label: string;
    description: string;
    content: string;
    genre: string;
    tags: string;
    creator: string;
    rating: number;
    releaseYear: number;
    youtube: boolean;
    youtube_url?: string;
    netflix: boolean;
    netflix_url?: string;
    showmax: boolean;
    showmax_url?: string;
    primevideo: boolean;
    primevideo_url?: string;
    irokotv: boolean;
    irokotv_url?: string;
    thumbnail?: File | string;
  }