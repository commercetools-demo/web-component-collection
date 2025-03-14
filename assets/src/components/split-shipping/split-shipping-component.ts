import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';

export default class SplitShipping extends LitElement {
  static properties = {
    baseUrl: { type: String, attribute: 'base-url' },
    locale: { type: String },
    cartId: { type: String, attribute: 'cart-id' },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    isOpen: { type: Boolean, state: true }
  };

  baseUrl: string = '';
  locale: string = 'en-US';
  cartId: string = '';
  cartItemId: string = '';
  isOpen: boolean = false;
  
  private cart: Cart | null = null;

  static styles = css`
    .split-shipping-button {
      background-color: var(--split-shipping-button-background-color, #3f51b5);
      color: var(--split-shipping-button-color, white);
      border: var(--split-shipping-button-border, none);
      padding: var(--split-shipping-button-padding, 8px 16px);
      border-radius: var(--split-shipping-button-border-radius, 4px);
      cursor: var(--split-shipping-button-cursor, pointer);
      font-family: var(--split-shipping-button-font-family, sans-serif);
      font-size: var(--split-shipping-button-font-size, 14px);
      display: var(--split-shipping-button-display, flex);
      align-items: var(--split-shipping-button-align-items, center);
      justify-content: var(--split-shipping-button-justify-content, center);
    }
    
    .split-shipping-button:hover {
      background-color: var(--split-shipping-button-hover-background-color, #303f9f);
    }
  `;

  private async openModal() {
    try {
      await this.fetchCartData()
      this.isOpen = true;
    } catch (error) {
      console.error('Error opening split shipping modal:', error);
    }
  }

  private closeModal() {
    this.isOpen = false;
  }

  private async fetchCartData() {
    if (!this.cartId) {
      throw new Error('Cart ID is required');
    }

    try {
      // If baseUrl is provided, use it for the request, otherwise use the default commercetools client
      if (this.baseUrl) {
        const response = await fetch(`${this.baseUrl}/carts/${this.cartId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch cart: ${response.statusText}`);
        }
        this.cart = await response.json();
        return this.cart;
      }
      return null;
    } catch (error) {
      console.error('Error fetching cart data:', error);
      throw error;
    }
  }

  private async handleAddressesSelected(event: CustomEvent) {
    if (!this.baseUrl || !this.cartId || !this.cartItemId) {
      console.error('Missing required parameters for updating item shipping address');
      return;
    }

    try {
      const addresses = event.detail.addresses;
      
      if (!addresses || !Array.isArray(addresses)) {
        console.error('Invalid addresses data received', event.detail);
        return;
      }


      const response = await fetch(`${this.baseUrl}/carts/${this.cartId}/add-item-shipping-addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItemId: this.cartItemId,
          addresses: addresses
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update item shipping address: ${response.statusText}`);
      }

      // Update the cart with the new data
      const updatedCart = await response.json();
      this.cart = updatedCart;

    } catch (error) {
      console.error('Error updating item shipping address:', error);
    }
  }

  private async handleShippingAllocationSubmitted(event: CustomEvent) {
    if (!this.baseUrl || !this.cartId || !this.cartItemId) {
      console.error('Missing required parameters for updating item shipping address');
      return;
    }

    const response = await fetch(`${this.baseUrl}/carts/${this.cartId}/line-items/${this.cartItemId}/shipping-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targets: event.detail.targets
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update item shipping address: ${response.statusText}`);
    }

    const updatedCart = await response.json();  
    this.cart = updatedCart;
  }

  render() {
    return html`
      <button class="split-shipping-button" @click=${this.openModal}>
        <slot>Split Shipping</slot>
      </button>
      
      ${this.isOpen ? html`
        <split-shipping-modal
          .locale=${this.locale}
          .cart=${this.cart}
          .cartItemId=${this.cartItemId}
          @close=${this.closeModal}
          @addresses-selected=${this.handleAddressesSelected}
          @shipping-allocation-submitted=${this.handleShippingAllocationSubmitted}
        ></split-shipping-modal>
      ` : ''}
    `;
  }
}

customElements.define('split-shipping', SplitShipping); 