import { Address, Cart, ShippingMethod, ProjectSettings } from '../types/checkout';

export class CheckoutService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getCartById(cartId: string): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/carts/${cartId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }
    return response.json();
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    const response = await fetch(`${this.baseUrl}/account/${userId}/addresses`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user addresses: ${response.statusText}`);
    }
    return response.json();
  }

  async setShippingAddress(cartId: string, address: Address): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/carts/${cartId}/set-shipping-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) {
      throw new Error(`Failed to set shipping address: ${response.statusText}`);
    }
    return response.json();
  }

  async setBillingAddress(cartId: string, address: Address): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/carts/${cartId}/set-billing-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) {
      throw new Error(`Failed to set billing address: ${response.statusText}`);
    }
    return response.json();
  }

  async addItemShippingAddresses(cartId: string, addresses: Address[]): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/carts/${cartId}/add-item-shipping-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add item shipping addresses: ${response.statusText}`);
    }
    return response.json();
  }

  async updateItemShippingAddresses(cartId: string, addresses: { addressKey: string; address: Address }[]): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/carts/${cartId}/update-item-shipping-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update item shipping addresses: ${response.statusText}`);
    }
    return response.json();
  }

  async setLineItemShippingAddress(cartId: string, lineItemId: string, targets: { addressKey: string; quantity: number; shippingMethodKey?: string }[]): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/carts/${cartId}/line-items/${lineItemId}/shipping-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targets }),
    });
    if (!response.ok) {
      throw new Error(`Failed to set line item shipping address: ${response.statusText}`);
    }
    return response.json();
  }

  async addShippingMethods(cartId: string, methods: {shippingKey: string, shippingMethodId: string, shippingAddress: Address}[]): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/carts/${cartId}/add-shipping-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({methods}),
    });
    if (!response.ok) {
      throw new Error(`Failed to add shipping method: ${response.statusText}`);
    }
    return response.json();
  }

  async setShippingMethod(cartId: string, shippingAddress: Address, shippingKey: string, shippingMethodId: string): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/carts/${cartId}/set-shipping-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shippingAddress, shippingKey, shippingMethodId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to set shipping method: ${response.statusText}`);
    }
    return response.json();
  }

  async getShippingMethods(): Promise<ShippingMethod[]> {
    const response = await fetch(`${this.baseUrl}/shipping-methods`);
    if (!response.ok) {
      throw new Error(`Failed to fetch shipping methods: ${response.statusText}`);
    }
    return response.json();
  }

  async getProjectSettings(): Promise<ProjectSettings> {
    const response = await fetch(`${this.baseUrl}/get-project-settings`);
    if (!response.ok) {
      throw new Error(`Failed to fetch project settings: ${response.statusText}`);
    }
    return response.json();
  }
} 