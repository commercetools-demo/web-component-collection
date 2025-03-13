import type { Cart } from '@commercetools/platform-sdk';

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: {
    amount: number;
    currencyCode: string;
  };
}

class SplitShippingShippingSection extends HTMLElement {
  private cart: Cart | null = null;
  private cartItemId: string = '';
  private locale: string = 'en-US';
  private shippingMethods: ShippingMethod[] = [];
  private selectedShippingMethodId: string = '';
  private isLoading: boolean = false;

  static get observedAttributes() {
    return ['cart', 'cart-item-id', 'locale'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.fetchShippingMethods();
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'cart':
        try {
          this.cart = JSON.parse(newValue);
        } catch (e) {
          console.error('Invalid cart JSON:', e);
        }
        break;
      case 'cart-item-id':
        this.cartItemId = newValue;
        break;
      case 'locale':
        this.locale = newValue;
        break;
    }

    if (name === 'cart' || name === 'cart-item-id') {
      this.fetchShippingMethods();
    }
    
    this.render();
  }

  private async fetchShippingMethods() {
    if (!this.cart) return;

    this.isLoading = true;
    this.render();

    try {
      // In a real implementation, you would fetch shipping methods from the API
      // For this example, we'll create some mock data
      // In a real implementation, you might use:
      // const response = await makeCtRequest('/shipping-methods');
      
      // Mock data for demonstration
      this.shippingMethods = [
        {
          id: 'standard',
          name: 'Standard Shipping',
          description: '3-5 business days',
          price: {
            amount: 5.99,
            currencyCode: this.cart.totalPrice?.currencyCode || 'USD'
          }
        },
        {
          id: 'express',
          name: 'Express Shipping',
          description: '1-2 business days',
          price: {
            amount: 12.99,
            currencyCode: this.cart.totalPrice?.currencyCode || 'USD'
          }
        },
        {
          id: 'overnight',
          name: 'Overnight Shipping',
          description: 'Next business day',
          price: {
            amount: 19.99,
            currencyCode: this.cart.totalPrice?.currencyCode || 'USD'
          }
        }
      ];

      // Select the first shipping method by default
      if (this.shippingMethods.length > 0 && !this.selectedShippingMethodId) {
        this.selectedShippingMethodId = this.shippingMethods[0].id;
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private setupEventListeners() {
    if (!this.shadowRoot) return;

    // Handle shipping method selection
    const shippingMethodRadios = this.shadowRoot.querySelectorAll('input[name="shipping-method"]');
    shippingMethodRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.selectedShippingMethodId = target.value;
      });
    });

    // Handle submit button
    const submitButton = this.shadowRoot.querySelector('#shipping-submit');
    submitButton?.addEventListener('click', () => {
      this.submitShippingSelection();
    });
  }

  private async submitShippingSelection() {
    if (!this.selectedShippingMethodId || !this.cart || !this.cartItemId) {
      alert('Please select a shipping method');
      return;
    }

    try {
      // Find the selected shipping method
      const selectedMethod = this.shippingMethods.find(method => method.id === this.selectedShippingMethodId);
      if (!selectedMethod) {
        throw new Error('Selected shipping method not found');
      }

      // Dispatch event to notify that a shipping method has been selected
      this.dispatchEvent(new CustomEvent('shipping-method-selected', {
        detail: {
          cartItemId: this.cartItemId,
          shippingMethodId: this.selectedShippingMethodId
        },
        bubbles: true,
        composed: true
      }));

      // Show success message
      alert('Shipping method selected successfully');
    } catch (error) {
      console.error('Error submitting shipping method selection:', error);
      alert('Failed to select shipping method');
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .shipping-section {
          font-family: sans-serif;
        }
        
        .shipping-methods {
          margin-bottom: 24px;
        }
        
        .shipping-method {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .shipping-method:hover {
          background-color: #f9f9f9;
        }
        
        .shipping-method.selected {
          border-color: #3f51b5;
          background-color: rgba(63, 81, 181, 0.05);
        }
        
        .shipping-method-radio {
          margin-right: 16px;
        }
        
        .shipping-method-details {
          flex: 1;
        }
        
        .shipping-method-name {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .shipping-method-description {
          color: #666;
          font-size: 14px;
        }
        
        .shipping-method-price {
          font-weight: bold;
          color: #333;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          color: #666;
        }
        
        button {
          background-color: #3f51b5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        button:hover {
          background-color: #303f9f;
        }
        
        .button-container {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }
      </style>
      
      <div class="shipping-section">
        ${this.isLoading ? `
          <div class="loading">Loading shipping methods...</div>
        ` : `
          <div class="shipping-methods">
            ${this.shippingMethods.length === 0 ? `
              <p>No shipping methods available</p>
            ` : this.shippingMethods.map(method => `
              <label class="shipping-method ${this.selectedShippingMethodId === method.id ? 'selected' : ''}">
                <input 
                  type="radio" 
                  name="shipping-method" 
                  value="${method.id}" 
                  class="shipping-method-radio"
                  ${this.selectedShippingMethodId === method.id ? 'checked' : ''}
                >
                <div class="shipping-method-details">
                  <div class="shipping-method-name">${method.name}</div>
                  ${method.description ? `<div class="shipping-method-description">${method.description}</div>` : ''}
                </div>
                <div class="shipping-method-price">
                  ${method.price.amount.toFixed(2)} ${method.price.currencyCode}
                </div>
              </label>
            `).join('')}
          </div>
          
          <div class="button-container">
            <button id="shipping-submit">Apply Shipping Method</button>
          </div>
        `}
      </div>
    `;

    this.setupEventListeners();
  }
}

customElements.define('split-shipping-shipping-section', SplitShippingShippingSection);

export default SplitShippingShippingSection; 