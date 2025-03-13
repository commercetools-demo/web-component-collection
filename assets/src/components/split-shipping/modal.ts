import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

interface Account {
  id: string;
  addresses?: any[];
  [key: string]: any;
}

export default class SplitShippingModal extends LitElement {
  static properties = {
    cart: { type: Object },
    account: { type: Object },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    locale: { type: String },
    isOpen: { type: Boolean, state: true }
  };

  cart: Cart | null = null;
  account: Account | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  isOpen: boolean = false;
  
  private addressSectionExpanded: boolean = true;
  private shippingSectionExpanded: boolean = true;

  static styles = css`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: white;
      border-radius: 4px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }
    
    .modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }
    
    .modal-body {
      padding: 16px;
      flex: 1;
    }
    
    .section {
      margin-bottom: 24px;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    
    .section-header {
      padding: 12px 16px;
      background-color: #f5f5f5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      border-bottom: 1px solid #eee;
    }
    
    .section-title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    .section-toggle {
      font-size: 18px;
    }
    
    .section-content {
      padding: 16px;
    }
    
    .hidden {
      display: none;
    }
  `;

  open() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }

  close() {
    this.isOpen = false;
    document.body.style.overflow = ''; // Restore scrolling
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

  render() {
    if (!this.isOpen) {
      return html``;
    }

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
                  .account=${this.account}
                  cart-item-id=${this.cartItemId}
                  locale=${this.locale}
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
                  cart-item-id=${this.cartItemId}
                  locale=${this.locale}
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