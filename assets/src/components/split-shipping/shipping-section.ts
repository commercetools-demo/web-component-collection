import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: {
    amount: number;
    currencyCode: string;
  };
}

export default class SplitShippingShippingSection extends LitElement {
  static properties = {
    cart: { type: Object },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    locale: { type: String }
  };

  cart: Cart | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  
  private shippingMethods: ShippingMethod[] = [];
  private selectedShippingMethodId: string = '';
  private isLoading: boolean = false;

  static styles = css`
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
  `;

  connectedCallback() {
    super.connectedCallback();
    this.fetchShippingMethods();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('cart') || changedProperties.has('cartItemId')) {
      this.fetchShippingMethods();
    }
  }

  private async fetchShippingMethods() {
    if (!this.cart) return;

    this.isLoading = true;
    this.requestUpdate();

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
      this.requestUpdate();
    }
  }

  private handleShippingMethodChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.selectedShippingMethodId = target.value;
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

  render() {
    return html`
      <div class="shipping-section">
        <h4>Select a shipping method</h4>
        
        ${this.isLoading ? 
          html`<div class="loading">Loading shipping methods...</div>` : 
          html`
            <div class="shipping-methods">
              ${this.shippingMethods.map(method => html`
                <label 
                  class="shipping-method ${method.id === this.selectedShippingMethodId ? 'selected' : ''}"
                  for="shipping-method-${method.id}"
                >
                  <input 
                    type="radio" 
                    name="shipping-method" 
                    id="shipping-method-${method.id}" 
                    value="${method.id}" 
                    class="shipping-method-radio"
                    ?checked=${method.id === this.selectedShippingMethodId}
                    @change=${this.handleShippingMethodChange}
                  />
                  <div class="shipping-method-details">
                    <div class="shipping-method-name">${method.name}</div>
                    ${method.description ? 
                      html`<div class="shipping-method-description">${method.description}</div>` : 
                      ''
                    }
                  </div>
                  <div class="shipping-method-price">
                    ${method.price.amount.toFixed(2)} ${method.price.currencyCode}
                  </div>
                </label>
              `)}
            </div>
            
            <div class="button-container">
              <button 
                id="shipping-submit"
                ?disabled=${!this.selectedShippingMethodId}
                @click=${this.submitShippingSelection}
              >
                Continue with Selected Shipping
              </button>
            </div>
          `
        }
      </div>
    `;
  }
}

customElements.define('split-shipping-shipping-section', SplitShippingShippingSection); 