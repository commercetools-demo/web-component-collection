import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { Address, ShippingMethod } from '../../types/checkout';

@customElement('normal-shipping-checkout-panel')
export default class NormalShippingCheckoutPanel extends LitElement {
  @property({ type: Object }) cart: any = null;
  @property({ type: Array }) userAddresses: Address[] = [];
  @property({ type: Array }) countries: string[] = [];
  @property({ type: Array }) shippingMethods: ShippingMethod[] = [];
  @property({ type: String }) locale = 'en-US';
  @property({ type: Boolean }) canUseSplitShipping = false;
  @property({ type: String }) cartId = '';
  @property({ type: String }) baseUrl = '';
  
  @state() private selectedAddressId = '';
  @state() private shippingAddress: Partial<Address> = {};
  @state() private billingAddress: Partial<Address> = {};
  @state() private billingAddressSameAsShipping = true;
  @state() private showBillingForm = false;
  @state() private isEditingShipping = true;
  @state() private isEditingBilling = false;
  @state() private selectedShippingMethodId = '';
  @state() private usingSavedAddresses = this.userAddresses.length > 0 ? true : false;


  private handleShippingAddressChange(e: CustomEvent) {
    const { address } = e.detail;
    if (!address.key){
      // create a new key
      address.key = new Date().getTime().toString();
    }
    this.shippingAddress = { ...address };
    this.dispatchEvent(new CustomEvent('shipping-address-changed', {
      detail: { address },
      bubbles: true,
      composed: true
    }));
  }

  private handleBillingAddressChange(e: CustomEvent) {
    const { address } = e.detail;
    this.billingAddress = { ...address };
    this.dispatchEvent(new CustomEvent('billing-address-changed', {
      detail: { address },
      bubbles: true,
      composed: true
    }));
  }

  private toggleBillingAddressForm() {
    this.billingAddressSameAsShipping = !this.billingAddressSameAsShipping;
    this.showBillingForm = !this.billingAddressSameAsShipping;
    this.dispatchEvent(new CustomEvent('billing-same-as-shipping-changed', {
      detail: { billingAddressSameAsShipping: this.billingAddressSameAsShipping },
      bubbles: true,
      composed: true
    }));
  }

  private handleEditBillingAddress() {
    this.isEditingBilling = true;
    this.isEditingShipping = true;
    this.showBillingForm = true;
    this.billingAddressSameAsShipping = false;
    this.dispatchEvent(new CustomEvent('edit-billing-address', {
      bubbles: true,
      composed: true
    }));
  }

  private handleNewAddressClick() {
    // Unselect the previously selected address radio button
    const addressRadios = this.shadowRoot?.querySelectorAll('input[name="saved-addresses"]');
    if (addressRadios) {
      addressRadios.forEach((radio: Element) => {
        (radio as HTMLInputElement).checked = false;
      });
    }
    
    // Reset the selected address ID and show the form
    this.selectedAddressId = '';
    this.shippingAddress = {};
    this.isEditingShipping = true;
    this.usingSavedAddresses = false;
    this.dispatchEvent(new CustomEvent('new-address-click', {
      detail: { selectedAddressId: '', shippingAddress: {}, isEditingShipping: true, usingSavedAddresses: false },
      bubbles: true,
      composed: true
    }));
  }

  private handleToggleSplitShipping() {
    this.dispatchEvent(new CustomEvent('toggle-split-shipping', {
      bubbles: true,
      composed: true
    }));
  }

  private handleContinueToDelivery() {
    this.isEditingShipping = false;
    this.dispatchEvent(new CustomEvent('continue-to-delivery', {
      bubbles: true,
      composed: true
    }));
  }

  private handleShippingMethodSelection(e: CustomEvent) {
    this.selectedShippingMethodId = e.detail.shippingMethodId;
    this.dispatchEvent(new CustomEvent('shipping-method-selected', {
      detail: { shippingMethodId: this.selectedShippingMethodId },
      bubbles: true,
      composed: true
    }));
  }

  private handleSubmitShipping() {
    this.dispatchEvent(new CustomEvent('submit-shipping', {
      bubbles: true,
      composed: true
    }));
  }

  private handleSavedAddressSelected(address: Address) {
    this.selectedAddressId = address.id || '';
    this.shippingAddress = { ...address };
    this.isEditingShipping = false;
    this.usingSavedAddresses = true;
    this.dispatchEvent(new CustomEvent('saved-address-selected', {
      detail: { 
        selectedAddressId: this.selectedAddressId, 
        shippingAddress: this.shippingAddress,
        isEditingShipping: this.isEditingShipping,
        usingSavedAddresses: this.usingSavedAddresses
      },
      bubbles: true,
      composed: true
    }));
  }

  private handleEditShippingAddress() {
    this.isEditingShipping = true;
    
    // If we were using a saved address, we're now editing it manually
    if (this.usingSavedAddresses) {
      this.usingSavedAddresses = false;
      this.selectedAddressId = '';
    }
    
    this.dispatchEvent(new CustomEvent('edit-shipping-address', {
      detail: { 
        isEditingShipping: this.isEditingShipping,
        usingSavedAddresses: this.usingSavedAddresses,
        selectedAddressId: this.selectedAddressId
      },
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
  
    .section-title {
      font-size: 14px;
      font-weight: 400;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border: 1px solid var(--checkout-border-color, #e0e0e0);
      border-radius: 4px;
      background-color: var(--checkout-background-color, #ffffff);
    }

    .button {
      padding: var(--checkout-button-padding, 0.75rem 1.5rem);
      font-size: 1rem;
      font-weight: 500;
      border: none;
      border-radius: var(--checkout-button-border-radius, 4px);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .primary-button {
      background-color: var(--checkout-primary-color, #3366ff);
      color: var(--checkout-button-text-color, #fff);
    }

    .primary-button:disabled {
      background-color: var(--checkout-primary-color-disabled, #666);
      color: var(--checkout-primary-color-disabled-text, #fff);
      cursor: not-allowed;
    }
      
    .primary-button:hover:not(:disabled) {
      background-color: var(--checkout-primary-color-hover, #2255ee);
    }

    .secondary-button {
      background-color: transparent;
      color: var(--checkout-primary-color, #3366ff);
      border: 0;
      border-bottom: 1px solid var(--checkout-primary-color, #3366ff);
      width: fit;
    }

    .secondary-button:hover {
      background-color: var(--checkout-secondary-button-hover-background-color, rgba(51, 102, 255, 0.1));
    }

    .saved-addresses-fieldset {
      border: none;
      padding: 0;
      margin: 0 0 1.5rem 0;
    }

    .saved-addresses-fieldset legend {
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .saved-addresses {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .address-radio-container {
      display: block;
      cursor: pointer;
      position: relative;
    }

    .address-radio-container input[type="radio"] {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 1;
    }

    .address-radio-container.selected address-preview {
      --address-border-color: var(--checkout-primary-color, #3366ff);
      --address-background-color: rgba(51, 102, 255, 0.05);
    }

    .billing-checkbox {
      display: flex;
      align-items: center;
      margin: 1.5rem 0;
    }

    .billing-checkbox input {
      margin-right: 0.5rem;
    }

    .address-header {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 1rem;
      color: var(--checkout-text-color, #333333);
    }

    .address-form-container {
      margin-bottom: 1.5rem;
    }

    .actions-container {
      margin-top: 1.5rem;
      display: flex;
      justify-content: space-between;
    }

    .selected-address-container {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: rgba(51, 102, 255, 0.05);
      border-radius: 4px;
      border: 1px solid rgba(51, 102, 255, 0.2);
    }
    
    .selected-address-container h4 {
      margin-top: 0;
      margin-bottom: 0.75rem;
      color: var(--checkout-primary-color, #3366ff);
    }
  `;

  render() {
    if (!this.cart) return html``;
    
    return html`
      <div class="section">
        <div class="section-title">
          <h3 class="address-header">Shipping Address</h3>
          ${this.canUseSplitShipping ? html`
            <button class="secondary-button" @click="${this.handleToggleSplitShipping}">
              Ship to multiple addresses
            </button>
          ` : ''}
        </div>
        
        ${this.userAddresses.length > 0 ? html`
          <fieldset class="saved-addresses-fieldset">
            <legend>Saved Addresses</legend>
            <div class="saved-addresses">
              ${repeat(this.userAddresses, (address) => address.id || '', (address) => html`
                <label class="address-radio-container ${this.selectedAddressId === address.id ? 'selected' : ''}">
                  <input 
                    type="radio" 
                    name="saved-addresses" 
                    value="${address.id || ''}"
                    ?checked="${this.selectedAddressId === address.id}"
                    @change="${() => this.handleSavedAddressSelected(address)}"
                  >
                  <address-preview
                    .address="${address}"
                    .showRadio="${false}"
                    .selected="${this.selectedAddressId === address.id}"
                    .addressId="${address.id || ''}"
                    .locale="${this.locale}"
                  ></address-preview>
                </label>
              `)}
            </div>
            <button class="secondary-button" @click="${this.handleNewAddressClick}">
              Ship to a new address
            </button>
          </fieldset>
        ` : ''}
        
        ${this.isEditingShipping ? html`
          ${!this.usingSavedAddresses ? html`
            <div class="address-form-container">
              <address-form
                .address="${this.shippingAddress}"
                .countries="${this.countries}"
                .locale="${this.locale}"
                .formId="shipping"
                @address-changed="${this.handleShippingAddressChange}"
              ></address-form>
            </div>
          ` : html``}
          
          <div class="billing-checkbox">
            <input 
              type="checkbox" 
              id="billing-same" 
              ?checked="${this.billingAddressSameAsShipping}"
              @change="${this.toggleBillingAddressForm}"
            >
            <label for="billing-same">Billing address same as shipping address</label>
          </div>
          
          ${this.showBillingForm || this.isEditingBilling ? html`
            <h3 class="address-header">Billing Address</h3>
            <div class="address-form-container">
              <address-form
                .address="${this.billingAddress}"
                .countries="${this.countries}"
                .locale="${this.locale}"
                .formId="billing"
                @address-changed="${this.handleBillingAddressChange}"
              ></address-form>
            </div>
          ` : ''}
          
          <button 
            class="primary-button" 
            @click="${this.handleContinueToDelivery}"
            ?disabled="${!this.shippingAddress.country || 
                      (!this.billingAddressSameAsShipping && !this.billingAddress.country)}"
          >
            Continue to Delivery
          </button>
        ` : html`

          ${!this.usingSavedAddresses ? html`
          <div class="selected-address-container">
            <h4>Selected Shipping Address</h4>
            <address-preview
              .address="${this.shippingAddress as Address}"
              .showEdit="${true}"
              .locale="${this.locale}"
              @edit-address="${this.handleEditShippingAddress}"
            ></address-preview>
          </div>
        `:html``}
          
          ${!this.billingAddressSameAsShipping ? html`
            <h3 class="address-header">Billing Address</h3>
            <address-preview
              .address="${this.billingAddress as Address}"
              .showEdit="${true}"
              .locale="${this.locale}"
              @edit-address="${this.handleEditBillingAddress}"
            ></address-preview>
          ` : ''}
          
          <div class="delivery-container">
            <delivery-method
              .shippingMethods="${this.shippingMethods}"
              .selectedMethodId="${this.selectedShippingMethodId}"
              .locale="${this.locale}"
              @shipping-method-selected="${this.handleShippingMethodSelection}"
            ></delivery-method>
            
            <button 
              class="primary-button" 
              @click="${this.handleSubmitShipping}"
              ?disabled="${!this.selectedShippingMethodId}"
              style="margin-top: 1.5rem;"
            >
              Continue to Payment
            </button>
          </div>
        `}
      </div>
    `;
  }
} 