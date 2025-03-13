import type { Cart } from '@commercetools/platform-sdk';

interface Account {
  id: string;
  addresses?: any[];
  [key: string]: any;
}

class SplitShippingModal extends HTMLElement {
  private cart: Cart | null = null;
  private account: Account | null = null;
  private cartItemId: string = '';
  private locale: string = 'en-US';
  private isOpen: boolean = false;
  private addressSectionExpanded: boolean = true;
  private shippingSectionExpanded: boolean = true;

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
        } catch (e) {
          console.error('Invalid cart JSON:', e);
        }
        break;
      case 'account':
        try {
          this.account = JSON.parse(newValue);
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

    if (this.isOpen) {
      this.render();
    }
  }

  public open() {
    this.isOpen = true;
    this.render();
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }

  public close() {
    this.isOpen = false;
    this.render();
    document.body.style.overflow = ''; // Restore scrolling
  }

  private setupEventListeners() {
    if (!this.shadowRoot) return;

    // Close modal when clicking on backdrop or close button
    const backdrop = this.shadowRoot.querySelector('.modal-backdrop');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    const closeButton = this.shadowRoot.querySelector('.modal-close');
    closeButton?.addEventListener('click', () => this.close());

    // Toggle sections
    const addressToggle = this.shadowRoot.querySelector('.address-section-header');
    addressToggle?.addEventListener('click', () => {
      this.addressSectionExpanded = !this.addressSectionExpanded;
      this.render();
    });

    const shippingToggle = this.shadowRoot.querySelector('.shipping-section-header');
    shippingToggle?.addEventListener('click', () => {
      this.shippingSectionExpanded = !this.shippingSectionExpanded;
      this.render();
    });
  }

  private render() {
    if (!this.shadowRoot) return;

    if (!this.isOpen) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
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
      </style>
      
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Split Shipping</h2>
            <button class="modal-close">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="section">
              <div class="section-header address-section-header">
                <h3 class="section-title">Addresses</h3>
                <span class="section-toggle">${this.addressSectionExpanded ? '▼' : '▶'}</span>
              </div>
              <div class="section-content ${this.addressSectionExpanded ? '' : 'hidden'}">
                <split-shipping-address-section 
                  cart-item-id="${this.cartItemId}"
                  locale="${this.locale}"
                  ${this.cart ? `cart='${JSON.stringify(this.cart).replace(/'/g, '&apos;')}'` : ''}
                  ${this.account ? `account='${JSON.stringify(this.account).replace(/'/g, '&apos;')}'` : ''}
                ></split-shipping-address-section>
              </div>
            </div>
            
            <div class="section">
              <div class="section-header shipping-section-header">
                <h3 class="section-title">Shipping</h3>
                <span class="section-toggle">${this.shippingSectionExpanded ? '▼' : '▶'}</span>
              </div>
              <div class="section-content ${this.shippingSectionExpanded ? '' : 'hidden'}">
                <split-shipping-shipping-section 
                  cart-item-id="${this.cartItemId}"
                  locale="${this.locale}"
                  ${this.cart ? `cart='${JSON.stringify(this.cart).replace(/'/g, '&apos;')}'` : ''}
                ></split-shipping-shipping-section>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }
}

customElements.define('split-shipping-modal', SplitShippingModal);

export default SplitShippingModal; 