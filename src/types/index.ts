export interface Song {
  id: string;
  name: string;
  duration: number;
  language: string;
  album: {
    id: string;
    name: string;
    url?: string;
  };
  artists: {
    primary: Array<{
      id: string;
      name: string;
    }>;
  };
  image: Array<{
    quality: string;
    url: string;
  }>;
  downloadUrl: Array<{
    quality: string;
    url: string;
  }>;
  year?: string;
  primaryArtists?: string;
  playCount?: string;
}

export interface SearchResponse {
  status: string;
  data: {
    total: number;
    start: number;
    results: Song[];
  };
}

export interface SongsResponse {
  success: boolean;
  data: Song[];
}

export type PlayMode = 'normal' | 'repeat' | 'repeat-one' | 'shuffle';
