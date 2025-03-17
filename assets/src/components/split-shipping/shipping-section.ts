import type { Cart, LineItem } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import { ShippingAddress } from './shipping-address-item';
import './shipping-address-item';

export default class SplitShippingShippingSection extends LitElement {
  static properties = {
    cart: { type: Object },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    locale: { type: String },
    addresses: { type: Array },
    addressQuantities: { type: Object }
  };

  cart: Cart | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  addresses: ShippingAddress[] = [];
  addressQuantities: Record<string, number> = {};
  
  private currentLineItem: LineItem | null = null;
  private isLoading: boolean = false;
  private errorMessage: string = '';
  private itemShippingAddresses: ShippingAddress[] = [];

  static styles = css`
    .shipping-section {
      font-family: var(--shipping-section-font-family, sans-serif);
      padding: var(--shipping-section-padding, 20px);
    }
    
    .section-title {
      font-size: var(--section-title-font-size, 18px);
      font-weight: var(--section-title-font-weight, bold);
      margin-bottom: var(--section-title-margin-bottom, 16px);
      color: var(--section-title-color, #333);
    }
    
    .address-list {
      margin-bottom: var(--address-list-margin-bottom, 24px);
    }
    
    .address-section-title {
      font-size: var(--address-section-title-font-size, 16px);
      font-weight: var(--address-section-title-font-weight, bold);
      margin: var(--address-section-title-margin, 16px 0 8px);
      color: var(--address-section-title-color, #555);
    }
    
    .loading {
      display: var(--loading-display, flex);
      justify-content: var(--loading-justify-content, center);
      align-items: var(--loading-align-items, center);
      padding: var(--loading-padding, 24px);
      color: var(--loading-color, #666);
    }
    
    .error-message {
      color: var(--error-message-color, #d32f2f);
      margin: var(--error-message-margin, 16px 0);
      padding: var(--error-message-padding, 8px);
      background-color: var(--error-message-background-color, rgba(211, 47, 47, 0.1));
      border-radius: var(--error-message-border-radius, 4px);
    }
    
    button {
      background-color: var(--button-background-color, #3f51b5);
      color: var(--button-color, white);
      border: var(--button-border, none);
      padding: var(--button-padding, 8px 16px);
      border-radius: var(--button-border-radius, 4px);
      cursor: var(--button-cursor, pointer);
      font-size: var(--button-font-size, 14px);
    }
    
    button:hover {
      background-color: var(--button-hover-background-color, #303f9f);
    }
    
    button:disabled {
      background-color: var(--button-disabled-background-color, #cccccc);
      cursor: var(--button-disabled-cursor, not-allowed);
    }
    
    .button-container {
      margin-top: var(--button-container-margin-top, 24px);
      display: var(--button-container-display, flex);
      justify-content: var(--button-container-justify-content, flex-end);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadLineItemAndAddresses();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('cart') || changedProperties.has('cartItemId') || changedProperties.has('addresses') || changedProperties.has('addressQuantities')) {
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

      // Map cart.itemShippingAddresses to our ShippingAddress type
      this.itemShippingAddresses = (this.cart.itemShippingAddresses || [])
        .map(address => {
          // First try to get quantity from shippingDetails targets
          let quantity = this.currentLineItem?.shippingDetails?.targets.find(
            target => target.addressKey === address.key
          )?.quantity || 0;
          
          // If quantity is 0, try to get it from combinedAddressQuantities using the address key
          if (quantity === 0 && address.key && this.addressQuantities[address.key] !== undefined) {
            quantity = this.addressQuantities[address.key];
          }
          
          return {
            ...address,
            id: address.id || '', // Ensure id is always a string
            country: address.country, // Required by our interface
            quantity: quantity,
            comment: '' // Default comment
          };
        });

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
    const { addressKey, quantity } = e.detail;
    
    // Find and update the address in our array
    const index = this.itemShippingAddresses.findIndex(addr => addr.key === addressKey);
    
    if (index !== -1) {
      this.itemShippingAddresses[index].quantity = quantity;
      this.requestUpdate();
    }
  }

  private handleCommentChanged(e: CustomEvent) {
    const { addressKey, comment } = e.detail;
    
    // Find and update the address in our array
    const index = this.itemShippingAddresses.findIndex(addr => addr.key === addressKey);
    
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
      const targets = allocatedAddresses.map(addr => ({
        addressKey: addr.key,
        quantity: addr.quantity
      }));

      // Dispatch event to notify that addresses have been allocated
      this.dispatchEvent(new CustomEvent('shipping-allocation-submitted', {
        detail: {
          lineItemId: this.cartItemId,
          targets: targets
        },
        bubbles: true,
        composed: true
      }));

      // Show success message
    } catch (error) {
      console.error('Error submitting shipping allocation:', error);
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