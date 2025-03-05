export interface Channel {
  id: string;
  name?: string;
}

export interface Store {
  storeId?: string;
  key: string;
  name?: string;
  distributionChannels?: Channel[];
  supplyChannels?: Channel[];
  geoLocation?: {
    lat?: number;
    lng?: number;
  };
}

export interface StoreSelectedEvent extends CustomEvent {
  detail: Store;
} 