import { LitElement, html, css } from 'lit';
import type { Address as CommercetoolsAddress } from '@commercetools/platform-sdk';

// Extend the commercetools Address type with our additional properties
export interface ShippingAddress extends Partial<CommercetoolsAddress> {
  id: string;
  country: string;
  quantity: number;
  comment: string;
}

export default class ShippingAddressItem extends LitElement {
  static properties = {
    address: { type: Object },
    maxQuantity: { type: Number, attribute: 'max-quantity' },
    locale: { type: String }
  };

  address: ShippingAddress = {
    id: '',
    country: '',
    quantity: 0,
    comment: ''
  };
  
  maxQuantity: number = 0;
  locale: string = 'en-US';

  static styles = css`
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
    
    .error-message {
      color: #d32f2f;
      font-size: 12px;
      margin-top: 4px;
    }
  `;

  private handleQuantityChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10) || 0;
    
    // Create a new address object with the updated quantity
    const updatedAddress = {
      ...this.address,
      quantity: newQuantity
    };
    
    // Dispatch event to notify parent component
    this.dispatchEvent(new CustomEvent('quantity-changed', {
      detail: {
        addressId: this.address.id,
        quantity: newQuantity,
        address: updatedAddress
      },
      bubbles: true,
      composed: true
    }));
  }

  private handleCommentChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newComment = target.value;
    
    // Create a new address object with the updated comment
    const updatedAddress = {
      ...this.address,
      comment: newComment
    };
    
    // Dispatch event to notify parent component
    this.dispatchEvent(new CustomEvent('comment-changed', {
      detail: {
        addressId: this.address.id,
        comment: newComment,
        address: updatedAddress
      },
      bubbles: true,
      composed: true
    }));
  }

  private formatAddress(address: ShippingAddress): string {
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
      <div class="address-item">
        <div class="address-details">
          <div class="address-line">${this.formatAddress(this.address)}</div>
          <input 
            type="text" 
            class="comment-input" 
            placeholder="Add a comment (optional)"
            .value=${this.address.comment || ''}
            @input=${this.handleCommentChange}
          />
        </div>
        <div class="quantity-control">
          <label>Quantity:</label>
          <input 
            type="number" 
            min="0" 
            max=${this.maxQuantity} 
            class="quantity-input"
            .value=${this.address.quantity.toString()}
            @input=${this.handleQuantityChange}
          />
        </div>
      </div>
    `;
  }
}

customElements.define('shipping-address-item', ShippingAddressItem); 