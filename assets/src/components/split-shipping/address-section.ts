import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

// Define our own Address interface to avoid read-only properties
interface AddressData {
  id?: string;
  country: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

interface Account {
  id: string;
  addresses?: AddressData[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  [key: string]: any;
}

export default class SplitShippingAddressSection extends LitElement {
  static properties = {
    cart: { type: Object },
    account: { type: Object },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    locale: { type: String }
  };

  cart: Cart | null = null;
  account: Account | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  
  private addresses: AddressData[] = [];
  private selectedAddressId: string = '';
  private newAddress: AddressData = {
    country: '',
    firstName: '',
    lastName: '',
    streetName: '',
    postalCode: '',
    city: '',
    phone: '',
    email: ''
  };
  private isAddingNewAddress: boolean = false;

  static styles = css`
    .address-section {
      font-family: sans-serif;
    }
    
    .address-select {
      width: 100%;
      padding: 8px;
      margin-bottom: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .new-address-form {
      margin-top: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .form-field {
      margin-bottom: 16px;
    }
    
    .form-field.full-width {
      grid-column: span 2;
    }
    
    label {
      display: block;
      margin-bottom: 4px;
      font-weight: bold;
      font-size: 14px;
    }
    
    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .hidden {
      display: none;
    }
    
    .button-container {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
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
    
    .add-address-button {
      background-color: transparent;
      color: #3f51b5;
      text-decoration: underline;
      border: none;
      padding: 0;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 16px;
    }
    
    .add-address-button:hover {
      color: #303f9f;
    }
  `;

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('cart') && this.cart) {
      this.extractAddresses();
    }
    
    if (changedProperties.has('account') && this.account) {
      this.extractAccountAddresses();
    }
  }

  private extractAddresses() {
    if (!this.cart) return;

    // Extract shipping addresses from the cart
    this.addresses = [];
    
    // Add the main shipping address if it exists
    if (this.cart.shippingAddress) {
      this.addresses.push({
        ...this.cart.shippingAddress,
        id: 'main'
      });
    }
    
    // Add any shipping addresses from shipping info
    if (this.cart.shippingInfo && this.cart.shippingInfo.deliveries && this.cart.shippingInfo.deliveries.length > 0) {
      this.cart.shippingInfo.deliveries.forEach((delivery, index) => {
        if (delivery.address) {
          this.addresses.push({
            ...delivery.address,
            id: `delivery-${index}`
          });
        }
      });
    }
    
    // Add any custom shipping addresses
    if (this.cart.itemShippingAddresses && this.cart.itemShippingAddresses.length > 0) {
      this.cart.itemShippingAddresses.forEach((address, index) => {
        this.addresses.push({
          ...address,
          id: `custom-${index}`
        });
      });
    }
    
    // If there are addresses, select the first one by default
    if (this.addresses.length > 0 && !this.selectedAddressId) {
      this.selectedAddressId = this.addresses[0].id || '';
    }
    
    this.requestUpdate();
  }

  private extractAccountAddresses() {
    if (!this.account || !this.account.addresses || this.account.addresses.length === 0) return;

    // Add customer account addresses
    this.account.addresses.forEach((address, index) => {
      // Check if this address is already in the list (by comparing key fields)
      const isDuplicate = this.addresses.some(addr => 
        addr.country === address.country &&
        addr.streetName === address.streetName &&
        addr.postalCode === address.postalCode &&
        addr.city === address.city
      );

      if (!isDuplicate) {
        // Add a label to indicate if this is a default address
        let label = '';
        if (this.account?.defaultShippingAddressId === address.id) {
          label = ' (Default Shipping)';
        } else if (this.account?.defaultBillingAddressId === address.id) {
          label = ' (Default Billing)';
        }

        this.addresses.push({
          ...address,
          id: `account-${address.id || index}`,
          label
        });
      }
    });

    // If there are addresses but none selected yet, select the default shipping address if available
    if (this.addresses.length > 0 && !this.selectedAddressId && this.account.defaultShippingAddressId) {
      const defaultAddress = this.addresses.find(addr => 
        addr.id === `account-${this.account?.defaultShippingAddressId}`
      );
      if (defaultAddress) {
        this.selectedAddressId = defaultAddress.id || '';
      } else {
        this.selectedAddressId = this.addresses[0].id || '';
      }
    } else if (this.addresses.length > 0 && !this.selectedAddressId) {
      this.selectedAddressId = this.addresses[0].id || '';
    }
    
    this.requestUpdate();
  }

  private handleAddressChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.selectedAddressId = select.value;
    this.isAddingNewAddress = this.selectedAddressId === 'new';
    this.requestUpdate();
  }

  private handleFormInput(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const field = target.name as keyof AddressData;
    this.newAddress = {
      ...this.newAddress,
      [field]: target.value
    };
  }

  private async submitAddressForm(e: Event) {
    e.preventDefault();
    
    try {
      // Validate the form
      if (!this.newAddress.country || !this.newAddress.firstName || !this.newAddress.lastName || 
          !this.newAddress.streetName || !this.newAddress.postalCode || !this.newAddress.city) {
        alert('Please fill in all required fields');
        return;
      }

      // Add the new address to the list
      const newAddressId = `new-${Date.now()}`;
      this.addresses = [
        ...this.addresses,
        {
          ...this.newAddress,
          id: newAddressId
        }
      ];

      // Select the new address
      this.selectedAddressId = newAddressId;
      this.isAddingNewAddress = false;
      this.newAddress = {
        country: '',
        firstName: '',
        lastName: '',
        streetName: '',
        postalCode: '',
        city: '',
        phone: '',
        email: ''
      };

      this.requestUpdate();
      
      // Dispatch event to notify that a new address has been added
      this.dispatchEvent(new CustomEvent('address-added', {
        detail: {
          cartItemId: this.cartItemId,
          address: this.addresses.find(addr => addr.id === newAddressId)
        },
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      console.error('Error adding new address:', error);
      alert('Failed to add new address');
    }
  }

  private async submitAddressSelection() {
    if (!this.selectedAddressId || !this.cartItemId) {
      alert('Please select an address');
      return;
    }

    try {
      // Find the selected address
      const selectedAddress = this.addresses.find(addr => addr.id === this.selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }

      // Dispatch event to notify that an address has been selected
      this.dispatchEvent(new CustomEvent('address-selected', {
        detail: {
          cartItemId: this.cartItemId,
          address: selectedAddress
        },
        bubbles: true,
        composed: true
      }));

      // Show success message
      alert('Address selected successfully');
    } catch (error) {
      console.error('Error submitting address selection:', error);
      alert('Failed to select address');
    }
  }

  private getAddressDisplayName(address: AddressData): string {
    if (!address) return '';
    
    const parts = [];
    
    if (address.firstName && address.lastName) {
      parts.push(`${address.firstName} ${address.lastName}`);
    }
    
    if (address.streetName) {
      parts.push(address.streetName);
    }
    
    if (address.city && address.postalCode) {
      parts.push(`${address.city}, ${address.postalCode}`);
    } else if (address.city) {
      parts.push(address.city);
    }
    
    if (address.country) {
      parts.push(address.country);
    }
    
    if (address.label) {
      parts.push(address.label);
    }
    
    return parts.join(' - ');
  }

  render() {
    return html`
      <div class="address-section">
        <h4>Select a shipping address</h4>
        
        <select 
          id="address-select" 
          class="address-select"
          @change=${this.handleAddressChange}
        >
          ${this.addresses.map(address => html`
            <option 
              value=${address.id} 
              ?selected=${address.id === this.selectedAddressId}
            >
              ${this.getAddressDisplayName(address)}
            </option>
          `)}
          <option value="new" ?selected=${this.selectedAddressId === 'new'}>Add a new address</option>
        </select>
        
        <form 
          id="new-address-form" 
          class=${classMap({ 'new-address-form': true, 'hidden': !this.isAddingNewAddress })}
          @submit=${this.submitAddressForm}
        >
          <div class="form-field">
            <label for="firstName">First Name *</label>
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              required 
              .value=${this.newAddress.firstName || ''}
              @input=${this.handleFormInput}
            />
          </div>
          
          <div class="form-field">
            <label for="lastName">Last Name *</label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              required 
              .value=${this.newAddress.lastName || ''}
              @input=${this.handleFormInput}
            />
          </div>
          
          <div class="form-field full-width">
            <label for="streetName">Street Address *</label>
            <input 
              type="text" 
              id="streetName" 
              name="streetName" 
              required 
              .value=${this.newAddress.streetName || ''}
              @input=${this.handleFormInput}
            />
          </div>
          
          <div class="form-field">
            <label for="city">City *</label>
            <input 
              type="text" 
              id="city" 
              name="city" 
              required 
              .value=${this.newAddress.city || ''}
              @input=${this.handleFormInput}
            />
          </div>
          
          <div class="form-field">
            <label for="postalCode">Postal Code *</label>
            <input 
              type="text" 
              id="postalCode" 
              name="postalCode" 
              required 
              .value=${this.newAddress.postalCode || ''}
              @input=${this.handleFormInput}
            />
          </div>
          
          <div class="form-field">
            <label for="country">Country *</label>
            <select 
              id="country" 
              name="country" 
              required 
              .value=${this.newAddress.country || ''}
              @change=${this.handleFormInput}
            >
              <option value="">Select a country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <!-- Add more countries as needed -->
            </select>
          </div>
          
          <div class="form-field">
            <label for="phone">Phone</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              .value=${this.newAddress.phone || ''}
              @input=${this.handleFormInput}
            />
          </div>
          
          <div class="form-field">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              .value=${this.newAddress.email || ''}
              @input=${this.handleFormInput}
            />
          </div>
          
          <div class="form-field full-width button-container">
            <button type="submit">Add Address</button>
          </div>
        </form>
        
        <div class="button-container">
          <button 
            id="address-submit"
            ?disabled=${!this.selectedAddressId || this.selectedAddressId === 'new'}
            @click=${this.submitAddressSelection}
          >
            Continue with Selected Address
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('split-shipping-address-section', SplitShippingAddressSection); 