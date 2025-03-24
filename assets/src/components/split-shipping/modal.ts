import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import './address-section';
import './shipping-section';

// Enum for wizard steps
enum WizardStep {
  ADDRESS = 0,
  SHIPPING = 1
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
    currentStep: { type: Number, state: true }
  };

  cart: Cart | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  addressQuantities: Record<string, number> = {};
  currentStep: WizardStep = WizardStep.ADDRESS;

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
    } else {
      this.currentStep = WizardStep.ADDRESS;
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

  private handleAddressesSelected(e: CustomEvent) {
  
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

  private renderWizardStep() {
    switch (this.currentStep) {
      case WizardStep.ADDRESS:
        return html`
          <split-shipping-address-section 
            .cart=${this.cart}
            .cartItemId=${this.cartItemId}
            .locale=${this.locale}
            @addresses-selected=${this.handleAddressesSelected}
          ></split-shipping-address-section>
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

  render() {
    return html`
      <div class="modal-backdrop" @click=${this.handleBackdropClick}>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Split Shipping</h2>
            <button class="modal-close" @click=${this.close}>&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="wizard-steps">
              <div 
                class=${classMap({ 'wizard-step': true, 'active': this.currentStep === WizardStep.ADDRESS })}
                @click=${() => this.goToStep(WizardStep.ADDRESS)}
              >
                1. Select Addresses
              </div>
              <div 
                class=${classMap({ 'wizard-step': true, 'active': this.currentStep === WizardStep.SHIPPING })}
                @click=${() => this.goToStep(WizardStep.SHIPPING)}
              >
                2. Allocate Shipping
              </div>
            </div>
            
            <div class="wizard-content">
              ${this.renderWizardStep()}
            </div>
            
            <div class="wizard-buttons">
              ${this.currentStep > 0 ? html`
                <button class="wizard-button previous" @click=${this.goToPreviousStep}>
                  Previous
                </button>
              ` : html`<div></div>`}
              
              ${this.currentStep === WizardStep.ADDRESS ? html`
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