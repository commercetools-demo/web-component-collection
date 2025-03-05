import { Store } from "../types/store";

export class StoresApiService {
  constructor(private baseUrl: string) {}

  async getGoogleMapApiKey(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/getGoogleMapApiKey`);
    if (!response.ok) {
      throw new Error(`Failed to get Google Maps API key: ${response.statusText}`);
    }
    return response.text();
  }

  async getStores(lat: number, lng: number, locale?: string): Promise<Store[]> {
    const url = new URL(`${this.baseUrl}/getStores`);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lng', lng.toString());
    if (locale) {
      url.searchParams.set('locale', locale);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to get stores: ${response.statusText}`);
    }
    return response.json();
  }

  async getStoreById(storeId: string, locale?: string): Promise<Store> {
    const url = new URL(`${this.baseUrl}/getStoreById`);
    url.searchParams.set('storeId', storeId);
    if (locale) {
      url.searchParams.set('locale', locale);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to get store: ${response.statusText}`);
    }
    return response.json();
  }
} 