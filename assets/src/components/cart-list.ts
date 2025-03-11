import { makeCtRequest } from '../utils/commercetools-client';
import type { Cart } from '@commercetools/platform-sdk';

class CartList extends HTMLElement {
  private carts: Cart[] = [];
  private dataLoaded: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    if (!this.dataLoaded) {
      await this.fetchCarts();
      this.render();
    }
  }

  private async fetchCarts() {
    try {
      const response = await makeCtRequest('/carts');
      this.carts = response.results;
      this.dataLoaded = true;
    } catch (error) {
      console.error('Error fetching carts:', error);
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .cart-list {
          padding: 1rem;
        }
        .cart-item {
          border: 1px solid #ccc;
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 4px;
        }
        .cart-id {
          font-weight: bold;
        }
        .cart-total {
          color: #666;
        }
      </style>
      <div class="cart-list">
        <h2>Shopping Carts</h2>
        ${this.carts.length === 0 
          ? '<p>No carts found</p>' 
          : this.carts.map(cart => `
            <div class="cart-item">
              <div class="cart-id">Cart ID: ${cart.id}</div>
              <div class="cart-total">Total: ${cart.totalPrice.centAmount / 100} ${cart.totalPrice.currencyCode}</div>
              <div>Items: ${cart.lineItems.length}</div>
            </div>
          `).join('')}
      </div>
    `;
  }
}

customElements.define('cart-list', CartList); 

export default CartList;