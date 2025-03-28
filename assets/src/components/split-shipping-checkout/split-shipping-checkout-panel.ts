import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Address, ShippingMethod } from '../../types/checkout';

interface LineItem {
  id: string;
  quantity: number;
}

interface CartType {
  lineItems: LineItem[];
}

@customElement('split-shipping-checkout-panel')
export default class SplitShippingCheckoutPanel extends LitElement {
  @property({ type: Object }) cart: CartType | null = null;
  @property({ type: Array }) countries: string[] = [];
  @property({ type: Array }) shippingMethods: ShippingMethod[] = [];
  @property({ type: String }) locale = 'en-US';
  @property({ type: Object }) remainingQuantities: Record<string, number> = {};
  @property({ type: Array }) multipleAddresses: {
    key: string;
    address: Partial<Address>;
    lineItems: {
      lineItemId: string;
      quantity: number;
    }[];
    showDelivery: boolean;
    isPreview?: boolean;
    shippingMethodId: string;
    giftMessage: string;
  }[] = [];
  @property({ type: Number }) splitAddressIndex = 0;
  

  private handleItemSelection(e: CustomEvent, addressIndex: number) {
    const { lineItemId, selected, quantity } = e.detail;
    const address = this.multipleAddresses[addressIndex];
    
    // Get the current quantity being used by this address for this lineItem
    const existingItem = address.lineItems.find(item => item.lineItemId === lineItemId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (selected) {
      // Add or update item
      if (existingItem) {
        // Calculate the change in quantity
        const quantityChange = quantity - currentQuantity;
        // Update remaining quantities based on the change
        this.dispatchEvent(new CustomEvent('remaining-quantities-changed', {
          detail: { lineItemId, quantityChange: -quantityChange },
          bubbles: true,
          composed: true
        }));
        // Update the item quantity
        existingItem.quantity = quantity;
      } else {
        // Adding a new item
        address.lineItems.push({ lineItemId, quantity });
        // Reduce remaining quantity
        this.dispatchEvent(new CustomEvent('remaining-quantities-changed', {
          detail: { lineItemId, quantityChange: -quantity },
          bubbles: true,
          composed: true
        }));
      }
    } else {
      // Remove item
      const existingItemIndex = address.lineItems.findIndex(item => item.lineItemId === lineItemId);
      if (existingItemIndex >= 0) {
        const removedQuantity = address.lineItems[existingItemIndex].quantity;
        this.dispatchEvent(new CustomEvent('remaining-quantities-changed', {
          detail: { lineItemId, quantityChange: removedQuantity },
          bubbles: true,
          composed: true
        }));
        address.lineItems.splice(existingItemIndex, 1);
      }
    }
    
    // Create a new copy to trigger updates
    const updatedAddresses = [...this.multipleAddresses];
    
    // Emit event to update parent component
    this.dispatchEvent(new CustomEvent('multiple-addresses-changed', {
      detail: { multipleAddresses: updatedAddresses },
      bubbles: true,
      composed: true
    }));
  }

  private handleMultipleAddressChange(e: CustomEvent, addressIndex: number) {
    const { address } = e.detail;
    const updatedAddresses = [...this.multipleAddresses];
    updatedAddresses[addressIndex].address = { ...address };
    
    // Emit event to update parent component
    this.dispatchEvent(new CustomEvent('multiple-addresses-changed', {
      detail: { multipleAddresses: updatedAddresses },
      bubbles: true,
      composed: true
    }));
  }
  
  private handleContinueToDelivery(addressIndex: number) {
    const updatedAddresses = [...this.multipleAddresses];
    updatedAddresses[addressIndex].showDelivery = true;
    
    // Emit event to update parent component
    this.dispatchEvent(new CustomEvent('multiple-addresses-changed', {
      detail: { multipleAddresses: updatedAddresses },
      bubbles: true,
      composed: true
    }));
  }

  private handleShippingMethodSelection(e: CustomEvent) {
    const { shippingMethodId, addressKey } = e.detail;
    const addressIndex = this.multipleAddresses.findIndex(addr => addr.key === addressKey);
    
    if (addressIndex >= 0) {
      const updatedAddresses = [...this.multipleAddresses];
      updatedAddresses[addressIndex].shippingMethodId = shippingMethodId;
      updatedAddresses[addressIndex].isPreview = true;
      // Emit event to update parent component
      this.dispatchEvent(new CustomEvent('multiple-addresses-changed', {
        detail: { multipleAddresses: updatedAddresses },
        bubbles: true,
        composed: true
      }));
    }
  }

  private handleGiftMessageChange(e: Event, addressIndex: number) {
    const input = e.target as HTMLTextAreaElement;
    const updatedAddresses = [...this.multipleAddresses];
    updatedAddresses[addressIndex].giftMessage = input.value;
    
    // Emit event to update parent component
    this.dispatchEvent(new CustomEvent('multiple-addresses-changed', {
      detail: { multipleAddresses: updatedAddresses },
      bubbles: true,
      composed: true
    }));
  }

  private handleAddAnotherAddress() {
    const newSplitAddressIndex = this.splitAddressIndex + 1;
    const updatedAddresses = [...this.multipleAddresses];
    
    updatedAddresses.push({
      key: `address-${this.splitAddressIndex}`,
      address: {},
      lineItems: [],
      showDelivery: false,
      shippingMethodId: '',
      giftMessage: ''
    });
    
    // Emit event to update parent component
    this.dispatchEvent(new CustomEvent('split-address-index-changed', {
      detail: { splitAddressIndex: newSplitAddressIndex },
      bubbles: true,
      composed: true
    }));
    
    this.dispatchEvent(new CustomEvent('multiple-addresses-changed', {
      detail: { multipleAddresses: updatedAddresses },
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

  private handleSubmitShipping() {
    this.dispatchEvent(new CustomEvent('submit-shipping', {
      bubbles: true,
      composed: true
    }));
  }

  private hasRemainingItems(): boolean {
    return Object.values(this.remainingQuantities).some((qty: number) => qty > 0);
  }

  private allAddressesWithItemsHaveShippingMethods(): boolean {
    return this.multipleAddresses
      .filter(addr => addr.lineItems.length > 0) // Only consider addresses with items
      .every(addr => addr.shippingMethodId);     // Check if any of these don't have shipping methods
  }

  private isAddressComplete(addressData: any): boolean {
    return (
      addressData.lineItems.length > 0 &&
      addressData.address?.country &&
      addressData.shippingMethodId
    );
  }

  private getSelectedShippingMethodName(shippingMethodId: string): string {
    const method = this.shippingMethods.find(method => method.id === shippingMethodId);
    return method?.name || '';
  }

  private getTotalSelectedItems(lineItems: any[]): number {
    return lineItems.reduce((total, item) => total + item.quantity, 0);
  }

  private handleEditAddress(addressIndex: number) {
    const updatedAddresses = [...this.multipleAddresses];
    updatedAddresses[addressIndex].showDelivery = false;
    updatedAddresses[addressIndex].isPreview = false;
    this.dispatchEvent(new CustomEvent('multiple-addresses-changed', {
      detail: { multipleAddresses: updatedAddresses },
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
    .section-title {
      font-size: 16px;
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
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .primary-button {
      background-color: var(--checkout-primary-color, #3366ff);
      color: white;
    }

    .primary-button:disabled {
      background-color: var(--checkout-primary-color-disabled, #666);
      color: var(--checkout-primary-color-disabled-text, #fff);
      cursor: not-allowed;
    }
      
    .primary-button:hover:not(:disabled) {
      background-color: #2255ee;
    }

    .secondary-button {
      background-color: transparent;
      color: var(--checkout-primary-color, #3366ff);
      border: 0;
      border-bottom: 1px solid var(--checkout-primary-color, #3366ff);
      width: fit;
    }

    .secondary-button:hover {
      background-color: rgba(51, 102, 255, 0.1);
    }

    .address-header {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 1rem;
      color: var(--checkout-text-color, #333333);
    }

    .split-items-container {
      margin-bottom: 1.5rem;
    }

    .gift-message {
      margin-top: 1rem;
    }

    .gift-message-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--checkout-border-color, #e0e0e0);
      border-radius: 4px;
      resize: vertical;
      min-height: 80px;
    }

    .actions-container {
      margin-top: 1.5rem;
      display: flex;
      justify-content: space-between;
    }

    .address-preview-container {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid var(--checkout-border-color, #e0e0e0);
      border-radius: 4px;
      background-color: var(--checkout-background-color-secondary, #f9f9f9);
    }

    .address-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .address-preview-title {
      font-weight: 500;
    }

    .address-preview-details {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
    }

    .address-preview-item-count {
      color: var(--checkout-text-color-secondary, #666);
    }

    .address-preview-shipping {
      color: var(--checkout-text-color-secondary, #666);
    }

    @media (max-width: 768px) {
      .section-title {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .section-title button {
        margin-top: 1rem;
      }
      
      .actions-container {
        flex-direction: column;
        gap: 1rem;
      }
      
      .button {
        width: 100%;
      }
    }
  `;

  render() {
    if (!this.cart) return html``;
    
    return html`
      <div class="section">
        <div class="section-title">
          <span>Multiple Shipping Addresses</span>
          <button class="secondary-button" @click="${this.handleToggleSplitShipping}">
            Ship to single address
          </button>
        </div>
        
        ${this.multipleAddresses.map((addressData, index) => {
          const isComplete = this.isAddressComplete(addressData);
          
          return isComplete && addressData.isPreview ? html`
            <div class="address-preview-container">
              <div class="address-preview-header">
                <h3 class="address-preview-title">Address ${index + 1}</h3>
                <button 
                  class="secondary-button" 
                  @click="${() => this.handleEditAddress(index)}"
                >
                  Edit
                </button>
              </div>
              
              <address-preview
                .address="${addressData.address as Address}"
                .locale="${this.locale}"
              ></address-preview>
              
              <div class="address-preview-details">
                <div class="address-preview-item-count">
                  ${this.getTotalSelectedItems(addressData.lineItems)} items
                </div>
                <div class="address-preview-shipping">
                  ${this.getSelectedShippingMethodName(addressData.shippingMethodId)}
                </div>
              </div>
            </div>
          ` : html`
            <div class="section">
              <h3 class="address-header">Address ${index + 1}</h3>
              
              <div class="split-items-container">
                <h4>Which items should we send to this address?</h4>
                ${this.cart?.lineItems.map((lineItem: LineItem) => {
                  const existingItem = addressData.lineItems.find(item => item.lineItemId === lineItem.id);
                  const quantity = existingItem ? existingItem.quantity : 0;
                  const selected = quantity > 0;
                  
                  return html`
                    <split-item
                      .lineItem="${lineItem}"
                      .remainingQuantity="${this.remainingQuantities[lineItem.id] || 0}"
                      .selectedQuantity="${quantity}"
                      .selected="${selected}"
                      .locale="${this.locale}"
                      @item-selection-changed="${(e: CustomEvent) => this.handleItemSelection(e, index)}"
                      @item-quantity-changed="${(e: CustomEvent) => this.handleItemSelection(e, index)}"
                    ></split-item>
                  `;
                })}
              </div>
              
              ${!addressData.showDelivery ? html`
                <div>
                  <h4>Where should we send them?</h4>
                  <address-form
                    .address="${addressData.address}"
                    .countries="${this.countries}"
                    .locale="${this.locale}"
                    .formId="address-${index}"
                    @address-changed="${(e: CustomEvent) => this.handleMultipleAddressChange(e, index)}"
                  ></address-form>
                  
                  <button 
                    class="primary-button" 
                    @click="${() => this.handleContinueToDelivery(index)}"
                    ?disabled="${!addressData.address?.country || !addressData.lineItems.length}"
                    style="margin-top: 1rem;"
                  >
                    Select delivery method
                  </button>
                </div>
              ` : html`
                <address-preview
                  .address="${addressData.address as Address}"
                  .showEdit="${true}"
                  .locale="${this.locale}"
                  @edit-address="${() => {
                    const updatedAddresses = [...this.multipleAddresses];
                    updatedAddresses[index].showDelivery = false;
                    
                    // Emit event to update parent component
                    this.dispatchEvent(new CustomEvent('multiple-addresses-changed', {
                      detail: { multipleAddresses: updatedAddresses },
                      bubbles: true,
                      composed: true
                    }));
                  }}"
                ></address-preview>

                <div class="gift-message">
                  <h4>Gift message? (optional)</h4>
                  <textarea 
                    class="gift-message-input"
                    .value="${addressData.giftMessage}"
                    @input="${(e: Event) => this.handleGiftMessageChange(e, index)}"
                    placeholder="Add a personalized message"
                  ></textarea>
                </div>
                
                <delivery-method
                  .shippingMethods="${this.shippingMethods}"
                  .selectedMethodId="${addressData.shippingMethodId}"
                  .locale="${this.locale}"
                  .addressKey="${addressData.key}"
                  @shipping-method-selected="${this.handleShippingMethodSelection}"
                ></delivery-method>
              `}
            </div>
          `;
        })}
        
        <div class="actions-container">
          ${this.hasRemainingItems() ? html`
            <button class="secondary-button" @click="${this.handleAddAnotherAddress}">
              Add another address
            </button>
          ` : html`
            <button 
              class="primary-button" 
              @click="${this.handleSubmitShipping}"
              ?disabled="${!this.allAddressesWithItemsHaveShippingMethods()}"
            >
              Continue to Payment
            </button>
          `}
        </div>
      </div>
    `;
  }
} 