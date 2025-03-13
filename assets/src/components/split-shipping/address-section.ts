import type { Cart } from '@commercetools/platform-sdk';

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

class SplitShippingAddressSection extends HTMLElement {
  private cart: Cart | null = null;
  private account: Account | null = null;
  private cartItemId: string = '';
  private locale: string = 'en-US';
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

  static get observedAttributes() {
    return ['cart', 'cart-item-id', 'locale', 'account'];
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
      case 'cart':
        try {
          this.cart = JSON.parse(newValue);
          if (this.cart) {
            this.extractAddresses();
          }
        } catch (e) {
          console.error('Invalid cart JSON:', e);
        }
        break;
      case 'account':
        try {
          this.account = JSON.parse(newValue);
          if (this.account) {
            this.extractAccountAddresses();
          }
        } catch (e) {
          console.error('Invalid account JSON:', e);
        }
        break;
      case 'cart-item-id':
        this.cartItemId = newValue;
        break;
      case 'locale':
        this.locale = newValue;
        break;
    }

    this.render();
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
  }

  private setupEventListeners() {
    if (!this.shadowRoot) return;

    // Handle address selection
    const addressSelect = this.shadowRoot.querySelector('#address-select');
    addressSelect?.addEventListener('change', (e) => {
      const select = e.target as HTMLSelectElement;
      this.selectedAddressId = select.value;
      this.isAddingNewAddress = this.selectedAddressId === 'new';
      this.render();
    });

    // Handle new address form
    const newAddressForm = this.shadowRoot.querySelector('#new-address-form');
    newAddressForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitAddressForm();
    });

    // Handle form input changes
    const formInputs = this.shadowRoot.querySelectorAll('#new-address-form input, #new-address-form select');
    formInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const field = target.name as keyof AddressData;
        this.newAddress[field] = target.value;
      });
    });

    // Handle submit button
    const submitButton = this.shadowRoot.querySelector('#address-submit');
    submitButton?.addEventListener('click', () => {
      this.submitAddressSelection();
    });
  }

  private async submitAddressForm() {
    try {
      // Validate the form
      if (!this.newAddress.country || !this.newAddress.firstName || !this.newAddress.lastName || 
          !this.newAddress.streetName || !this.newAddress.postalCode || !this.newAddress.city) {
        alert('Please fill in all required fields');
        return;
      }

      // Add the new address to the list
      const newAddressId = `new-${Date.now()}`;
      this.addresses.push({
        ...this.newAddress,
        id: newAddressId
      });

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

      this.render();
      
      // Dispatch event to notify that a new address has been added
      this.dispatchEvent(new CustomEvent('address-added', {
        detail: {
          addressId: newAddressId
        },
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      console.error('Error submitting address form:', error);
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

      // Prepare the address data (remove the id field which is not part of the commercetools Address type)
      const { id, label, ...addressData } = selectedAddress;

      // Dispatch event to notify that an address has been selected
      this.dispatchEvent(new CustomEvent('address-selected', {
        detail: {
          cartItemId: this.cartItemId,
          address: addressData
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
    const parts = [
      address.firstName || '',
      address.lastName || '',
      address.streetName || '',
      address.city || '',
      address.postalCode || '',
      address.country || ''
    ].filter(Boolean);
    
    let displayName = parts.join(', ');
    
    // Add label if present (e.g., "Default Shipping")
    if (address.label) {
      displayName += address.label;
    }
    
    return displayName;
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .address-section {
          font-family: sans-serif;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        label {
          display: block;
          margin-bottom: 4px;
          font-weight: bold;
        }
        
        select, input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .new-address-form {
          margin-top: 16px;
          padding: 16px;
          border: 1px solid #eee;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        
        .form-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .form-row > div {
          flex: 1;
        }
        
        .required::after {
          content: " *";
          color: red;
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
      
      <div class="address-section">
        <div class="form-group">
          <label for="address-select">Select Shipping Address</label>
          <select id="address-select">
            ${this.addresses.map(address => `
              <option value="${address.id}" ${this.selectedAddressId === address.id ? 'selected' : ''}>
                ${this.getAddressDisplayName(address)}
              </option>
            `).join('')}
            <option value="new" ${this.isAddingNewAddress ? 'selected' : ''}>Add New Address</option>
          </select>
        </div>
        
        ${this.isAddingNewAddress ? `
          <form id="new-address-form" class="new-address-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="required">First Name</label>
                <input type="text" id="firstName" name="firstName" required value="${this.newAddress.firstName || ''}">
              </div>
              <div class="form-group">
                <label for="lastName" class="required">Last Name</label>
                <input type="text" id="lastName" name="lastName" required value="${this.newAddress.lastName || ''}">
              </div>
            </div>
            
            <div class="form-group">
              <label for="streetName" class="required">Street Address</label>
              <input type="text" id="streetName" name="streetName" required value="${this.newAddress.streetName || ''}">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="city" class="required">City</label>
                <input type="text" id="city" name="city" required value="${this.newAddress.city || ''}">
              </div>
              <div class="form-group">
                <label for="postalCode" class="required">Postal Code</label>
                <input type="text" id="postalCode" name="postalCode" required value="${this.newAddress.postalCode || ''}">
              </div>
            </div>
            
            <div class="form-group">
              <label for="country" class="required">Country</label>
              <select id="country" name="country" required>
                <option value="" ${!this.newAddress.country ? 'selected' : ''}>Select Country</option>
                <option value="US" ${this.newAddress.country === 'US' ? 'selected' : ''}>United States</option>
                <option value="CA" ${this.newAddress.country === 'CA' ? 'selected' : ''}>Canada</option>
                <option value="GB" ${this.newAddress.country === 'GB' ? 'selected' : ''}>United Kingdom</option>
                <option value="DE" ${this.newAddress.country === 'DE' ? 'selected' : ''}>Germany</option>
                <option value="FR" ${this.newAddress.country === 'FR' ? 'selected' : ''}>France</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" value="${this.newAddress.phone || ''}">
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="${this.newAddress.email || ''}">
              </div>
            </div>
            
            <div class="button-container">
              <button type="submit">Add Address</button>
            </div>
          </form>
        ` : ''}
        
        <div class="button-container">
          <button id="address-submit">Apply Address</button>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }
}

customElements.define('split-shipping-address-section', SplitShippingAddressSection);

export default SplitShippingAddressSection; 