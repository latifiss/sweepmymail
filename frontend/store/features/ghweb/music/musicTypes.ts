export interface Music {
    _id: string;
    title: string;
    label: string;
    description: string;
    content: string;
    genre: string;
    tags: string[];
    creator: string;
    rating: number;
    author: string;
    boomplay: boolean;
    boomplay_url?: string;
    spotify: boolean;
    spotify_url?: string;
    applemusic: boolean;
    applemusic_url?: string;
    audiomack: boolean;
    audiomack_url?: string;
    image_url?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MusicInput {
    title: string;
    label: string;
    description: string;
    content: string;
    genre: string;
    tags: string;
    creator: string;
    rating: number;
    author: string;
    boomplay: boolean;
    boomplay_url?: string;
    spotify: boolean;
    spotify_url?: string;
    applemusic: boolean;
    applemusic_url?: string;
    audiomack: boolean;
    audiomack_url?: string;
    thumbnail?: File | string;
  }