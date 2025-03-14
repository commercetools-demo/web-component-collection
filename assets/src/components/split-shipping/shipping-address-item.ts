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
      border: var(--address-item-border, 1px solid #eee);
      border-radius: var(--address-item-border-radius, 4px);
      padding: var(--address-item-padding, 16px);
      margin-bottom: var(--address-item-margin-bottom, 12px);
      display: var(--address-item-display, flex);
      align-items: var(--address-item-align-items, center);
    }
    
    .address-details {
      flex: var(--address-details-flex, 1);
    }
    
    .address-line {
      margin-bottom: var(--address-line-margin-bottom, 4px);
    }
    
    .quantity-control {
      display: var(--quantity-control-display, flex);
      align-items: var(--quantity-control-align-items, center);
      margin-left: var(--quantity-control-margin-left, 16px);
    }
    
    .quantity-input {
      width: var(--quantity-input-width, 60px);
      padding: var(--quantity-input-padding, 8px);
      border: var(--quantity-input-border, 1px solid #ddd);
      border-radius: var(--quantity-input-border-radius, 4px);
      text-align: var(--quantity-input-text-align, center);
      margin: var(--quantity-input-margin, 0 8px);
    }
    
    .comment-input {
      width: var(--comment-input-width, 100%);
      padding: var(--comment-input-padding, 8px);
      border: var(--comment-input-border, 1px solid #ddd);
      border-radius: var(--comment-input-border-radius, 4px);
      margin-top: var(--comment-input-margin-top, 8px);
    }
    
    .error-message {
      color: var(--error-message-color, #d32f2f);
      font-size: var(--error-message-font-size, 12px);
      margin-top: var(--error-message-margin-top, 4px);
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
        addressKey: this.address.key,
        quantity: newQuantity,
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