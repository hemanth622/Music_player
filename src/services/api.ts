import { Song, SearchResponse, SongsResponse } from '../types';

const BASE_URL = 'https://saavn.sumit.co';

export class ApiService {
  private async fetchJson<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network Error: ${error}`);
    }
  }

  async searchSongs(query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> {
    const url = `${BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    return this.fetchJson<SearchResponse>(url);
  }

  async getSongById(id: string): Promise<SongsResponse> {
    const url = `${BASE_URL}/api/songs/${id}`;
    return this.fetchJson<SongsResponse>(url);
  }

  async getSongs(): Promise<SongsResponse> {
    return { success: true, data: [] };
  }

  async getArtistSongs(artistId: string, page: number = 1, limit: number = 20): Promise<SongsResponse> {
    const url = `${BASE_URL}/api/artists/${artistId}/songs?page=${page}&limit=${limit}`;
    return this.fetchJson<SongsResponse>(url);
  }
}

export const apiService = new ApiService();
