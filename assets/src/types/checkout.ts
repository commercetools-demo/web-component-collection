export interface Address {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  country: string;
  state?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  company?: string;
  additionalAddressInfo?: string;
  key?: string;
}

export interface Cart {
  id: string;
  version: number;
  lineItems: LineItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMode?: string;
  itemShippingAddresses?: ItemShippingAddress[];
  shippingInfo?: {
    shippingMethod?: ShippingMethod;
  }
  shipping: {
    shippingAddress: Address;
    shippingInfo: {
      shippingMethod: ShippingMethod;
    };
    shippingKey: string;
  }[]
}

export interface LineItem {
  id: string;
  productId: string;
  name: Record<string, string>;
  variant: {
    sku: string;
  };
  quantity: number;
  shippingDetails?: {
    targets: ShippingTarget[];
  };
}

export interface ShippingTarget {
  addressKey: string;
  quantity: number;
  shippingMethodKey?: string;
}

export interface ItemShippingAddress extends Address {
  key: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  zoneRates?: ZoneRate[];
}

export interface ZoneRate {
  zone: Zone;
  shippingRates: ShippingRate[];
}

export interface Zone {
  id: string;
}

export interface ShippingRate {
  price: {
    centAmount: number;
    currencyCode: string;
  };
}


export interface ProjectSettings {
  countries: string[];
  currencies: string[];
}

export interface FormSubmittedEvent extends CustomEvent {
  detail: {
    addresses?: Address[];
    shippingMethods?: { addressKey: string; shippingMethodKey: string }[];
  };
} 