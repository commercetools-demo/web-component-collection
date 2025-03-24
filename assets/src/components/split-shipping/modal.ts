import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import './address-section';
import './shipping-section';
import './address-table';

// Enum for wizard steps
enum WizardStep {
  CSV_UPLOAD = 0,
  ADDRESS_TABLE = 1,
  SHIPPING = 2
}

export default class SplitShippingModal extends LitElement {
  static properties = {
    cart: { type: Object, hasChanged(newVal: Cart, oldVal: Cart) {
      // Custom hasChanged to detect deep changes in the cart object
      return JSON.stringify(newVal) !== JSON.stringify(oldVal);
    }},
    cartItemId: { type: String, attribute: 'cart-item-id' },
    locale: { type: String },
    addressQuantities: { type: Object },
    enableCSVUpload: { type: Boolean },
    currentStep: { type: Number, state: true },
    csvAddresses: { type: Array, state: true }
  };

  cart: Cart | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  addressQuantities: Record<string, number> = {};
  enableCSVUpload: boolean = false;
  currentStep: WizardStep = WizardStep.CSV_UPLOAD;
  csvAddresses: any[] = [];

  static styles = css`
    .modal-backdrop {
      position: var(--modal-backdrop-position, fixed);
      top: var(--modal-backdrop-top, 0);
      left: var(--modal-backdrop-left, 0);
      width: var(--modal-backdrop-width, 100%);
      height: var(--modal-backdrop-height, 100%);
      background-color: var(--modal-backdrop-background-color, rgba(0, 0, 0, 0.5));
      display: var(--modal-backdrop-display, flex);
      align-items: var(--modal-backdrop-align-items, center);
      justify-content: var(--modal-backdrop-justify-content, center);
      z-index: var(--modal-backdrop-z-index, 1000);
    }
    
    .modal-content {
      background-color: var(--modal-content-background-color, white);
      border-radius: var(--modal-content-border-radius, 4px);
      width: var(--modal-content-width, 90%);
      max-width: var(--modal-content-max-width, 800px);
      max-height: var(--modal-content-max-height, 90vh);
      overflow-y: var(--modal-content-overflow-y, auto);
      box-shadow: var(--modal-content-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.1));
      display: var(--modal-content-display, flex);
      flex-direction: var(--modal-content-flex-direction, column);
    }
    
    .modal-header {
      display: var(--modal-header-display, flex);
      justify-content: var(--modal-header-justify-content, space-between);
      align-items: var(--modal-header-align-items, center);
      padding: var(--modal-header-padding, 16px);
      border-bottom: var(--modal-header-border-bottom, 1px solid #eee);
    }
    
    .modal-title {
      margin: var(--modal-title-margin, 0);
      font-size: var(--modal-title-font-size, 18px);
      font-weight: var(--modal-title-font-weight, bold);
    }
    
    .modal-close {
      background: var(--modal-close-background, none);
      border: var(--modal-close-border, none);
      font-size: var(--modal-close-font-size, 24px);
      cursor: var(--modal-close-cursor, pointer);
      color: var(--modal-close-color, #666);
    }
    
    .modal-body {
      padding: var(--modal-body-padding, 16px);
      flex: var(--modal-body-flex, 1);
    }
    
    .wizard-steps {
      display: var(--wizard-steps-display, flex);
      justify-content: var(--wizard-steps-justify-content, center);
      margin-bottom: var(--wizard-steps-margin-bottom, 20px);
      border-bottom: var(--wizard-steps-border-bottom, 1px solid #eee);
      padding-bottom: var(--wizard-steps-padding-bottom, 10px);
    }
    
    .wizard-step {
      margin: var(--wizard-step-margin, 0 15px);
      padding: var(--wizard-step-padding, 8px 0);
      cursor: var(--wizard-step-cursor, pointer);
      color: var(--wizard-step-color, #666);
      position: var(--wizard-step-position, relative);
    }
    
    .wizard-step.active {
      color: var(--wizard-step-active-color, #3f51b5);
      font-weight: var(--wizard-step-active-font-weight, bold);
    }
    
    .wizard-step.active::after {
      content: '';
      position: absolute;
      bottom: -11px;
      left: 0;
      right: 0;
      height: 3px;
      background-color: var(--wizard-step-active-indicator-color, #3f51b5);
    }
    
    .wizard-content {
      min-height: var(--wizard-content-min-height, 200px);
    }
    
    .wizard-buttons {
      display: var(--wizard-buttons-display, flex);
      justify-content: var(--wizard-buttons-justify-content, space-between);
      margin-top: var(--wizard-buttons-margin-top, 20px);
      padding-top: var(--wizard-buttons-padding-top, 15px);
      border-top: var(--wizard-buttons-border-top, 1px solid #eee);
    }
    
    .wizard-button {
      background-color: var(--wizard-button-background-color, #3f51b5);
      color: var(--wizard-button-color, white);
      border: var(--wizard-button-border, none);
      padding: var(--wizard-button-padding, 8px 16px);
      border-radius: var(--wizard-button-border-radius, 4px);
      cursor: var(--wizard-button-cursor, pointer);
      font-size: var(--wizard-button-font-size, 14px);
    }
    
    .wizard-button.previous {
      background-color: var(--wizard-button-previous-background-color, #9e9e9e);
    }
    
    .wizard-button:hover {
      opacity: var(--wizard-button-hover-opacity, 0.9);
    }
    
    .info-message {
      padding: var(--info-message-padding, 16px);
      background-color: var(--info-message-background-color, #e3f2fd);
      border-radius: var(--info-message-border-radius, 4px);
      color: var(--info-message-color, #0d47a1);
      margin-bottom: var(--info-message-margin-bottom, 16px);
      text-align: var(--info-message-text-align, center);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    this.initializeWizardStep();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.style.overflow = ''; // Restore scrolling when modal is removed
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('cart')) {
      // When cart changes, notify child components by forcing an update
      this.requestUpdate();
      this.initializeWizardStep();
    }
  }

  private initializeWizardStep() {
    // Skip to shipping step if cart already has itemShippingAddresses
    if (this.hasShippingAddresses()) {
      this.currentStep = WizardStep.SHIPPING;
    } else if (!this.enableCSVUpload) {
      // Skip CSV step if it's disabled
      this.currentStep = WizardStep.ADDRESS_TABLE;
    } else {
      this.currentStep = WizardStep.CSV_UPLOAD;
    }
  }

  close() {
    // Dispatch a close event that will be caught by the parent component
    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true
    }));
  }

  private handleBackdropClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  private handleCsvParsed(e: CustomEvent) {
    // Store the parsed CSV addresses
    this.csvAddresses = e.detail.addresses || [];
    
    // Automatically move to address table step
    this.goToStep(WizardStep.ADDRESS_TABLE);
  }

  private handleAddressTableSubmit(e: CustomEvent) {
    // Handle address table submission
    this.dispatchEvent(new CustomEvent('addresses-selected', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
    
    // Move to shipping step
    this.goToStep(WizardStep.SHIPPING);
  }

  private goToStep(step: WizardStep) {
    this.currentStep = step;
  }

  private goToPreviousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  private goToNextStep() {
      this.currentStep++;
  }

  private hasShippingAddresses(): boolean {
    return !!(this.cart && 
              this.cart.itemShippingAddresses && 
              Array.isArray(this.cart.itemShippingAddresses) && 
              this.cart.itemShippingAddresses.length > 0);
  }

  private getCombinedAddresses() {
    // Start with CSV addresses
    const addresses = [...this.csvAddresses];
    
    // Add cart item shipping addresses if they exist
    if (this.cart && this.cart.itemShippingAddresses && Array.isArray(this.cart.itemShippingAddresses)) {
      const cartAddresses = this.cart.itemShippingAddresses.map(address => {
        // Find quantity for this address
        const quantity = this.addressQuantities[address.key || ''] || 
                        (this.cartItemId && this.cart?.lineItems ? 
                          this.cart.lineItems.find(item => item.id === this.cartItemId)?.shippingDetails?.targets.find(
                            target => target.addressKey === address.key
                          )?.quantity : 0) || 1;
        
        // Convert to CsvRowData format
        return {
          firstName: address.firstName || '',
          lastName: address.lastName || '',
          streetNumber: address.streetNumber || '',
          streetName: address.streetName || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.postalCode || '',
          country: address.country || '',
          quantity: quantity,
          key: address.key // Keep the original key
        };
      });
      
      // Add to addresses (avoiding duplicates by key)
      cartAddresses.forEach(address => {
        if (!addresses.some(a => a.key === address.key)) {
          addresses.push(address);
        }
      });
    }
    
    return addresses;
  }

  private renderWizardStep() {
    switch (this.currentStep) {
      case WizardStep.CSV_UPLOAD:
        return html`
          <split-shipping-address-section 
            .cart=${this.cart}
            .cartItemId=${this.cartItemId}
            .locale=${this.locale}
            @csv-parsed=${this.handleCsvParsed}
          ></split-shipping-address-section>
        `;
      case WizardStep.ADDRESS_TABLE:
        return html`
          <split-shipping-address-table
            .addresses=${this.getCombinedAddresses()}
            .cartItemId=${this.cartItemId}
            .locale=${this.locale}
            .isFirstStep=${!this.enableCSVUpload}
            @address-table-submit=${this.handleAddressTableSubmit}
          ></split-shipping-address-table>
        `;
      case WizardStep.SHIPPING:
        return html`
          <split-shipping-shipping-section 
            .cart=${this.cart}
            .cartItemId=${this.cartItemId}
            .locale=${this.locale}
            .addressQuantities=${this.addressQuantities}
          ></split-shipping-shipping-section>
        `;
      default:
        return html`<div>Invalid step</div>`;
    }
  }

  private getStepTitle(step: WizardStep): string {
    switch (step) {
      case WizardStep.CSV_UPLOAD:
        return "1. Upload CSV";
      case WizardStep.ADDRESS_TABLE:
        return this.enableCSVUpload ? "2. Review Addresses" : "1. Add Addresses";
      case WizardStep.SHIPPING:
        return this.enableCSVUpload ? "3. Allocate Shipping" : "2. Allocate Shipping";
      default:
        return "";
    }
  }

  private getVisibleSteps() {
    // Return all steps or filter out CSV_UPLOAD step based on enableCSVUpload
    return this.enableCSVUpload 
      ? [WizardStep.CSV_UPLOAD, WizardStep.ADDRESS_TABLE, WizardStep.SHIPPING]
      : [WizardStep.ADDRESS_TABLE, WizardStep.SHIPPING];
  }

  render() {
    const visibleSteps = this.getVisibleSteps();
    const combinedAddresses = this.getCombinedAddresses();
    
    return html`
      <div class="modal-backdrop" @click=${this.handleBackdropClick}>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Split Shipping</h2>
            <button class="modal-close" @click=${this.close}>&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="wizard-steps">
              ${visibleSteps.map(step => html`
                <div 
                  class=${classMap({ 
                    'wizard-step': true, 
                    'active': this.currentStep === step 
                  })}
                  @click=${() => {this.goToStep(step)}}
                >
                  ${this.getStepTitle(step)}
                </div>
              `)}
            </div>
            
            <div class="wizard-content">
              ${this.renderWizardStep()}
            </div>
            
            <div class="wizard-buttons">
              ${this.currentStep > (this.enableCSVUpload ? WizardStep.CSV_UPLOAD : WizardStep.ADDRESS_TABLE) ? html`
                <button class="wizard-button previous" @click=${this.goToPreviousStep}>
                  Previous
                </button>
              ` : html`<div></div>`}
              
              ${this.currentStep === WizardStep.CSV_UPLOAD ? html`
                <button class="wizard-button next" @click=${this.goToNextStep}>
                  Next
                </button>
              ` : this.currentStep === WizardStep.ADDRESS_TABLE ? html`
                <button class="wizard-button next" @click=${this.goToNextStep}>
                  Next
                </button>
              ` : html`<div></div>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('split-shipping-modal', SplitShippingModal); 