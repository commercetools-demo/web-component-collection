import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';

export default class SplitShipping extends LitElement {
  static properties = {
    baseUrl: { type: String, attribute: 'base-url' },
    locale: { type: String },
    cartId: { type: String, attribute: 'cart-id' },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    accountId: { type: String, attribute: 'account-id' }
  };

  baseUrl: string = '';
  locale: string = 'en-US';
  cartId: string = '';
  cartItemId: string = '';
  accountId: string = '';
  
  private cart: Cart | null = null;
  private modal: HTMLElement | null = null;

  static styles = css`
    .split-shipping-button {
      background-color: #3f51b5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-family: sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .split-shipping-button:hover {
      background-color: #303f9f;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.addEventListener('click', () => this.openModal());
  }

  private async openModal() {
    try {
      // Fetch both cart and account data in parallel
      const [cartData, accountData] = await Promise.all([
        this.fetchCartData(),
        this.fetchAccountData()
      ]);
      
      // Create modal if it doesn't exist
      if (!this.modal) {
        this.modal = document.createElement('split-shipping-modal');
        this.modal.setAttribute('locale', this.locale);
        
        if (this.cart) {
          this.modal.setAttribute('cart', JSON.stringify(this.cart));
        }
        
        if (accountData) {
          this.modal.setAttribute('account', JSON.stringify(accountData));
        }
        
        this.modal.setAttribute('cart-item-id', this.cartItemId);
        this.renderRoot.appendChild(this.modal);
      }
      
      // Show modal
      if (this.modal) {
        (this.modal as any).open();
      }
    } catch (error) {
      console.error('Error opening split shipping modal:', error);
    }
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

  private async fetchAccountData() {
    if (!this.accountId || !this.baseUrl) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/account/${this.accountId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch account: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching account data:', error);
      return null;
    }
  }

  render() {
    return html`
      <button class="split-shipping-button">
        <slot>Split Shipping</slot>
      </button>
    `;
  }
}

customElements.define('split-shipping', SplitShipping); 