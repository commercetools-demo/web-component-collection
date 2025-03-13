import type { Cart, LineItem } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import { ShippingAddress } from './shipping-address-item';
import './shipping-address-item';

export default class SplitShippingShippingSection extends LitElement {
  static properties = {
    cart: { type: Object },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    locale: { type: String },
    addresses: { type: Array }
  };

  cart: Cart | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  addresses: ShippingAddress[] = [];
  
  private currentLineItem: LineItem | null = null;
  private isLoading: boolean = false;
  private errorMessage: string = '';
  private itemShippingAddresses: ShippingAddress[] = [];

  static styles = css`
    .shipping-section {
      font-family: sans-serif;
      padding: 20px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #333;
    }
    
    .address-list {
      margin-bottom: 24px;
    }
    
    .address-section-title {
      font-size: 16px;
      font-weight: bold;
      margin: 16px 0 8px;
      color: #555;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      color: #666;
    }
    
    .error-message {
      color: #d32f2f;
      margin: 16px 0;
      padding: 8px;
      background-color: rgba(211, 47, 47, 0.1);
      border-radius: 4px;
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
    
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .button-container {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadLineItemAndAddresses();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('cart') || changedProperties.has('cartItemId') || changedProperties.has('addresses')) {
      this.loadLineItemAndAddresses();
    }
  }

  private loadLineItemAndAddresses() {
    if (!this.cart || !this.cartItemId) return;

    this.isLoading = true;
    this.requestUpdate();

    try {
      // Find the current line item
      this.currentLineItem = this.cart.lineItems.find(item => item.id === this.cartItemId) || null;
      
      if (!this.currentLineItem) {
        throw new Error(`Line item with ID ${this.cartItemId} not found in cart`);
      }

      console.log('Resetting item shipping addresses');

      // Map cart.itemShippingAddresses to our ShippingAddress type
      this.itemShippingAddresses = (this.cart.itemShippingAddresses || [])
        .map(address => ({
          ...address,
          id: address.id || '', // Ensure id is always a string
          country: address.country, // Required by our interface
          quantity: 0, // Default quantity
          comment: '' // Default comment
        }));

      // If no addresses yet, initialize with empty array
      if (this.itemShippingAddresses.length === 0) {
        this.itemShippingAddresses = [];
      }
    } catch (error) {
      console.error('Error loading line item and addresses:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load data';
    } finally {
      this.isLoading = false;
      this.requestUpdate();
    }
  }

  private handleQuantityChanged(e: CustomEvent) {
    const { addressId, quantity, address } = e.detail;
    
    // Find and update the address in our array
    const index = this.itemShippingAddresses.findIndex(addr => addr.id === addressId);
    
    if (index !== -1) {
      this.itemShippingAddresses[index].quantity = quantity;
      this.requestUpdate();
    }
  }

  private handleCommentChanged(e: CustomEvent) {
    const { addressId, comment } = e.detail;
    
    // Find and update the address in our array
    const index = this.itemShippingAddresses.findIndex(addr => addr.id === addressId);
    
    if (index !== -1) {
      this.itemShippingAddresses[index].comment = comment;
      this.requestUpdate();
    }
  }

  private getTotalAllocatedQuantity(): number {
    return this.itemShippingAddresses.reduce((sum, addr) => sum + (addr.quantity || 0), 0);
  }

  private isQuantityValid(): boolean {
    if (!this.currentLineItem) return false;
    
    const totalAllocated = this.getTotalAllocatedQuantity();
    return totalAllocated > 0 && totalAllocated === this.currentLineItem.quantity;
  }

  private async submitShippingAllocation() {
    if (!this.isQuantityValid() || !this.currentLineItem || !this.cartItemId) {
      return;
    }

    try {
      // Get all addresses with their quantities
      const allocatedAddresses = this.itemShippingAddresses.filter(addr => addr.quantity > 0);

      // Dispatch event to notify that addresses have been allocated
      this.dispatchEvent(new CustomEvent('shipping-allocation-submitted', {
        detail: {
          cartItemId: this.cartItemId,
          addresses: allocatedAddresses
        },
        bubbles: true,
        composed: true
      }));

      // Show success message
      alert('Shipping allocation submitted successfully');
    } catch (error) {
      console.error('Error submitting shipping allocation:', error);
      alert('Failed to submit shipping allocation');
    }
  }

  render() {
    return html`
      <div class="shipping-section">
        ${this.isLoading ? 
          html`<div class="loading">Loading data...</div>` : 
          html`
            ${this.currentLineItem ? 
              html`
                <h3 class="section-title">
                  Split shipping of "${this.currentLineItem.name[this.locale] || this.currentLineItem.name['en-US'] || 'Item'}" 
                  into different shipping addresses
                </h3>
                
                ${this.errorMessage ? 
                  html`<div class="error-message">${this.errorMessage}</div>` : 
                  ''
                }
                
                <div class="address-list">
                  ${this.itemShippingAddresses.length > 0 ? 
                    html`
                      <h4 class="address-section-title">Shipping Addresses</h4>
                      ${this.itemShippingAddresses.map(address => html`
                        <shipping-address-item
                          .address=${address}
                          .maxQuantity=${this.currentLineItem?.quantity || 0}
                          .locale=${this.locale}
                          @quantity-changed=${this.handleQuantityChanged}
                          @comment-changed=${this.handleCommentChanged}
                        ></shipping-address-item>
                      `)}
                    ` : 
                    html`<p>No shipping addresses available. Please add addresses in the address section first.</p>`
                  }
                </div>
                
                <div class="quantity-summary">
                  <p>
                    Total allocated: ${this.getTotalAllocatedQuantity()} of ${this.currentLineItem.quantity}
                    ${!this.isQuantityValid() ? 
                      html`<span class="error-message">
                        ${this.getTotalAllocatedQuantity() > this.currentLineItem.quantity ? 
                          'Total allocated quantity exceeds available quantity' : 
                          'Total allocated quantity must equal available quantity'
                        }
                      </span>` : 
                      ''
                    }
                  </p>
                </div>
                
                <div class="button-container">
                  <button 
                    id="shipping-submit"
                    ?disabled=${!this.isQuantityValid()}
                    @click=${this.submitShippingAllocation}
                  >
                    Continue with Selected Allocation
                  </button>
                </div>
              ` : 
              html`<p>Line item not found in cart</p>`
            }
          `
        }
      </div>
    `;
  }
}

customElements.define('split-shipping-shipping-section', SplitShippingShippingSection); 