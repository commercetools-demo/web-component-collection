import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ShippingMethod } from '../../types/checkout';

@customElement('delivery-method')
export class DeliveryMethod extends LitElement {
  @property({ type: Array }) shippingMethods: ShippingMethod[] = [];
  @property({ type: String }) selectedMethodId = '';
  @property({ type: String }) locale = 'en-US';
  @property({ type: String }) addressKey = '';

  @state() private loading = false;
  @state() private error = '';

  static styles = css`
    :host {
      display: block;
      --delivery-border-color: #e0e0e0;
      --delivery-background-color: #ffffff;
      --delivery-text-color: #333333;
      --delivery-selected-border-color: #3366ff;
      --delivery-selected-background-color: #f0f5ff;
      --delivery-price-color: #666666;
      --error-color: #ff3366;
    }

    .delivery-title {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .delivery-methods {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .delivery-method {
      padding: 1rem;
      border: 1px solid var(--delivery-border-color);
      border-radius: 4px;
      background-color: var(--delivery-background-color);
      color: var(--delivery-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
    }

    .delivery-method.selected {
      border-color: var(--delivery-selected-border-color);
      background-color: var(--delivery-selected-background-color);
    }

    .delivery-method-radio {
      margin-right: 1rem;
    }

    .delivery-method-details {
      flex: 1;
    }

    .delivery-method-name {
      font-weight: 500;
      margin: 0 0 0.25rem 0;
    }

    .delivery-method-description {
      margin: 0;
      font-size: 0.9rem;
    }

    .delivery-method-price {
      font-weight: 500;
      color: var(--delivery-price-color);
    }

    .error-message {
      color: var(--error-color);
      margin-top: 1rem;
    }

    .loading {
      opacity: 0.5;
      pointer-events: none;
    }
  `;

  private formatPrice(price: { centAmount: number; currencyCode: string }) {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: price.currencyCode,
    }).format(price.centAmount / 100);
  }

  private handleMethodSelect(shippingMethodId: string) {
    this.selectedMethodId = shippingMethodId;
    
    this.dispatchEvent(new CustomEvent('shipping-method-selected', {
      detail: { 
        shippingMethodId,
        addressKey: this.addressKey
      },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (this.loading) {
      return html`<div class="delivery-methods loading">Loading shipping methods...</div>`;
    }

    if (this.error) {
      return html`<div class="error-message">${this.error}</div>`;
    }

    if (!this.shippingMethods.length) {
      return html`<div>No delivery methods available.</div>`;
    }

    return html`
      <div>
        <h3 class="delivery-title">Select Delivery Method</h3>
        <div class="delivery-methods">
          ${this.shippingMethods.map(method => html`
            <div 
              class="delivery-method ${this.selectedMethodId === method.id ? 'selected' : ''}"
              @click="${() => this.handleMethodSelect(method.id)}"
            >
              <input 
                type="radio" 
                name="delivery-method" 
                id="method-${method.id}" 
                class="delivery-method-radio"
                ?checked="${this.selectedMethodId === method.id}"
              >
              <div class="delivery-method-details">
                <p class="delivery-method-name">${method.name}</p>
                ${method.description ? html`<p class="delivery-method-description">${method.description}</p>` : ''}
              </div>
              <div class="delivery-method-price">
                ${this.formatPrice(method.zoneRates?.[0]?.shippingRates?.[0]?.price || { centAmount: 0, currencyCode: 'USD' })}
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }
} 