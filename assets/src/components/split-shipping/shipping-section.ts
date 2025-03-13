import type { Cart, LineItem } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';

interface Address {
  id: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  quantity: number;
  comment: string;
  isNew?: boolean;
}

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
  addresses: Address[] = [];
  
  private currentLineItem: LineItem | null = null;
  private isLoading: boolean = false;
  private errorMessage: string = '';
  private existingAddresses: Address[] = [];
  private newAddresses: Address[] = [];

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
    
    .address-item {
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    
    .address-details {
      flex: 1;
    }
    
    .address-line {
      margin-bottom: 4px;
    }
    
    .quantity-control {
      display: flex;
      align-items: center;
      margin-left: 16px;
    }
    
    .quantity-input {
      width: 60px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      text-align: center;
      margin: 0 8px;
    }
    
    .comment-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 8px;
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

      // Split addresses into existing and new
      this.existingAddresses = (this.addresses || [])
        .filter(address => !address.isNew)
        .map(address => ({
          ...address,
          quantity: address.quantity || 0,
          comment: address.comment || ''
        }));
      
      this.newAddresses = (this.addresses || [])
        .filter(address => address.isNew)
        .map(address => ({
          ...address,
          quantity: address.quantity || 0,
          comment: address.comment || ''
        }));

      // If no addresses yet, initialize with empty arrays
      if (this.addresses.length === 0) {
        // In a real implementation, you would fetch existing addresses from the account
        // For this example, we'll leave it empty
        this.existingAddresses = [];
        this.newAddresses = [];
      }
    } catch (error) {
      console.error('Error loading line item and addresses:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load data';
    } finally {
      this.isLoading = false;
      this.requestUpdate();
    }
  }

  private handleQuantityChange(e: Event, addressId: string, isNew: boolean = false) {
    const target = e.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10) || 0;
    
    const addressList = isNew ? this.newAddresses : this.existingAddresses;
    const address = addressList.find(addr => addr.id === addressId);
    
    if (address) {
      address.quantity = newQuantity;
      this.requestUpdate();
    }
  }

  private handleCommentChange(e: Event, addressId: string, isNew: boolean = false) {
    const target = e.target as HTMLInputElement;
    const newComment = target.value;
    
    const addressList = isNew ? this.newAddresses : this.existingAddresses;
    const address = addressList.find(addr => addr.id === addressId);
    
    if (address) {
      address.comment = newComment;
      this.requestUpdate();
    }
  }

  private getTotalAllocatedQuantity(): number {
    const existingTotal = this.existingAddresses.reduce((sum, addr) => sum + (addr.quantity || 0), 0);
    const newTotal = this.newAddresses.reduce((sum, addr) => sum + (addr.quantity || 0), 0);
    return existingTotal + newTotal;
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
      // Combine all addresses with their quantities
      const allocatedAddresses = [
        ...this.existingAddresses.filter(addr => addr.quantity > 0),
        ...this.newAddresses.filter(addr => addr.quantity > 0)
      ];

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

  private formatAddress(address: Address): string {
    const parts = [
      address.firstName,
      address.lastName,
      address.streetNumber,
      address.streetName,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
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
                  ${this.existingAddresses.length > 0 ? 
                    html`
                      <h4 class="address-section-title">Existing Addresses</h4>
                      ${this.existingAddresses.map(address => html`
                        <div class="address-item">
                          <div class="address-details">
                            <div class="address-line">${this.formatAddress(address)}</div>
                            <input 
                              type="text" 
                              class="comment-input" 
                              placeholder="Add a comment (optional)"
                              .value=${address.comment || ''}
                              @input=${(e: Event) => this.handleCommentChange(e, address.id)}
                            />
                          </div>
                          <div class="quantity-control">
                            <label>Quantity:</label>
                            <input 
                              type="number" 
                              min="0" 
                              max=${this.currentLineItem?.quantity || 0} 
                              class="quantity-input"
                              .value=${address.quantity.toString()}
                              @input=${(e: Event) => this.handleQuantityChange(e, address.id)}
                            />
                          </div>
                        </div>
                      `)}
                    ` : 
                    ''
                  }
                  
                  ${this.newAddresses.length > 0 ? 
                    html`
                      <h4 class="address-section-title">New Addresses</h4>
                      ${this.newAddresses.map(address => html`
                        <div class="address-item">
                          <div class="address-details">
                            <div class="address-line">${this.formatAddress(address)}</div>
                            <input 
                              type="text" 
                              class="comment-input" 
                              placeholder="Add a comment (optional)"
                              .value=${address.comment || ''}
                              @input=${(e: Event) => this.handleCommentChange(e, address.id, true)}
                            />
                          </div>
                          <div class="quantity-control">
                            <label>Quantity:</label>
                            <input 
                              type="number" 
                              min="0" 
                              max=${this.currentLineItem?.quantity || 0} 
                              class="quantity-input"
                              .value=${address.quantity.toString()}
                              @input=${(e: Event) => this.handleQuantityChange(e, address.id, true)}
                            />
                          </div>
                        </div>
                      `)}
                    ` : 
                    ''
                  }
                  
                  ${this.existingAddresses.length === 0 && this.newAddresses.length === 0 ? 
                    html`<p>No addresses available. Please add addresses in the address section first.</p>` : 
                    ''
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