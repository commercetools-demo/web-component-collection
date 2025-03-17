import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

export default class SplitShippingModal extends LitElement {
  static properties = {
    cart: { type: Object },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    locale: { type: String },
    addressQuantities: { type: Object }
  };

  cart: Cart | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  addressQuantities: Record<string, number> = {};
  
  private addressSectionExpanded: boolean = true;
  private shippingSectionExpanded: boolean = true;

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
    
    .section {
      margin-bottom: var(--section-margin-bottom, 24px);
      border: var(--section-border, 1px solid #eee);
      border-radius: var(--section-border-radius, 4px);
    }
    
    .section-header {
      padding: var(--section-header-padding, 12px 16px);
      background-color: var(--section-header-background-color, #f5f5f5);
      display: var(--section-header-display, flex);
      justify-content: var(--section-header-justify-content, space-between);
      align-items: var(--section-header-align-items, center);
      cursor: var(--section-header-cursor, pointer);
      border-bottom: var(--section-header-border-bottom, 1px solid #eee);
    }
    
    .section-title {
      margin: var(--section-title-margin, 0);
      font-size: var(--section-title-font-size, 16px);
      font-weight: var(--section-title-font-weight, bold);
    }
    
    .section-toggle {
      font-size: var(--section-toggle-font-size, 18px);
    }
    
    .section-content {
      padding: var(--section-content-padding, 16px);
    }
    
    .hidden {
      display: none;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.style.overflow = ''; // Restore scrolling when modal is removed
  }

  close() {
    // Dispatch a close event that will be caught by the parent component
    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true
    }));
  }

  private toggleAddressSection() {
    this.addressSectionExpanded = !this.addressSectionExpanded;
    this.requestUpdate();
  }

  private toggleShippingSection() {
    this.shippingSectionExpanded = !this.shippingSectionExpanded;
    this.requestUpdate();
  }

  private handleBackdropClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  private handleAddressesSelected(event: CustomEvent) {
    this.dispatchEvent(event);
    this.toggleAddressSection();
  }

  private handleShippingAllocationSubmitted(event: CustomEvent) {
    this.dispatchEvent(event);
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
            <div class="section">
              <div class="section-header" @click=${this.toggleAddressSection}>
                <h3 class="section-title">Addresses</h3>
                <span class="section-toggle">${this.addressSectionExpanded ? '▼' : '▶'}</span>
              </div>
              <div class=${classMap({ 'section-content': true, 'hidden': !this.addressSectionExpanded })}>
                <split-shipping-address-section 
                  .cart=${this.cart}
                  .cartItemId=${this.cartItemId}
                  .locale=${this.locale}
                  @addresses-selected=${this.handleAddressesSelected}
                ></split-shipping-address-section>
              </div>
            </div>
            
            <div class="section">
              <div class="section-header" @click=${this.toggleShippingSection}>
                <h3 class="section-title">Shipping</h3>
                <span class="section-toggle">${this.shippingSectionExpanded ? '▼' : '▶'}</span>
              </div>
              <div class=${classMap({ 'section-content': true, 'hidden': !this.shippingSectionExpanded })}>
                <split-shipping-shipping-section 
                  .cart=${this.cart}
                  .cartItemId=${this.cartItemId}
                  .locale=${this.locale}
                  .addressQuantities=${this.addressQuantities}
                  @shipping-allocation-submitted=${this.handleShippingAllocationSubmitted}
                ></split-shipping-shipping-section>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('split-shipping-modal', SplitShippingModal); 