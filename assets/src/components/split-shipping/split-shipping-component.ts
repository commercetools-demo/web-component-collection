import type { Cart } from '@commercetools/platform-sdk';

class SplitShipping extends HTMLElement {
  private baseUrl: string = '';
  private locale: string = 'en-US';
  private cartId: string = '';
  private cartItemId: string = '';
  private accountId: string = '';
  private cart: Cart | null = null;
  private modal: HTMLElement | null = null;

  static get observedAttributes() {
    return ['base-url', 'locale', 'cart-id', 'cart-item-id', 'account-id'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'base-url':
        this.baseUrl = newValue;
        break;
      case 'locale':
        this.locale = newValue;
        break;
      case 'cart-id':
        this.cartId = newValue;
        break;
      case 'cart-item-id':
        this.cartItemId = newValue;
        break;
      case 'account-id':
        this.accountId = newValue;
        break;
    }
  }

  private setupEventListeners() {
    const button = this.shadowRoot?.querySelector('.split-shipping-button');
    button?.addEventListener('click', () => this.openModal());
  }

  private async openModal() {
    try {
      // Fetch both cart and account data in parallel
      const [cartData, accountData] = await Promise.all([
        this.fetchCartData(),
        this.fetchAccountData()
      ]);
      
      // Create modal if it doesn't exist
      if (!this.modal && this.shadowRoot) {
        this.modal = document.createElement('split-shipping-modal');
        this.modal.setAttribute('locale', this.locale);
        
        if (this.cart) {
          this.modal.setAttribute('cart', JSON.stringify(this.cart));
        }
        
        if (accountData) {
          this.modal.setAttribute('account', JSON.stringify(accountData));
        }
        
        this.modal.setAttribute('cart-item-id', this.cartItemId);
        this.shadowRoot.appendChild(this.modal);
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

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
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
      </style>
      
      <button class="split-shipping-button">
        <slot>Split Shipping</slot>
      </button>
    `;
  }
}

customElements.define('split-shipping', SplitShipping);

export default SplitShipping; 