import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LineItem } from '../../types/checkout';

@customElement('split-item')
export class SplitItem extends LitElement {
  @property({ type: Object }) lineItem!: LineItem;
  @property({ type: Number }) remainingQuantity = 0;
  @property({ type: Number }) selectedQuantity = 0;
  @property({ type: Boolean }) selected = false;
  @property({ type: String }) locale = 'en-US';

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    
    // Ensure selected is true if selectedQuantity > 0
    if (changedProperties.has('selectedQuantity')) {
      if (this.selectedQuantity > 0 && !this.selected) {
        this.selected = true;
      } else if (this.selectedQuantity === 0 && this.selected) {
        this.selected = false;
      }
    }
  }

  static styles = css`
    :host {
      display: block;
      --item-border-color: #e0e0e0;
      --item-background-color: #ffffff;
      --item-text-color: #333333;
      --quantity-control-color: #3366ff;
    }

    .split-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border: 1px solid var(--item-border-color);
      border-radius: 4px;
      background-color: var(--item-background-color);
      margin-bottom: 0.5rem;
    }

    .item-checkbox {
      margin-right: 1rem;
      flex-shrink: 0;
    }

    .item-details {
      flex: 1;
      min-width: 0;
      margin-right: 1rem;
      overflow: hidden;
    }

    .item-name {
      font-weight: 500;
      margin: 0 0 0.25rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-sku {
      color: #666;
      font-size: 0.8rem;
      margin: 0;
    }

    .quantity-control {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .quantity-label {
      margin-right: 0.5rem;
      font-size: 0.9rem;
    }

    .quantity-input {
      width: 3rem;
      padding: 0.5rem;
      text-align: center;
      border: 1px solid var(--item-border-color);
      border-radius: 4px;
    }

    .quantity-input:focus {
      border-color: var(--quantity-control-color);
      outline: none;
    }

    .quantity-max {
      font-size: 0.8rem;
      color: #666;
      margin-left: 0.5rem;
    }

    .disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  `;

  private handleCheckboxChange(e: Event) {
    const checkbox = e.target as HTMLInputElement;
    this.selected = checkbox.checked;
    
    // If checked and quantity is 0, set to 1 (not max)
    if (this.selected && this.selectedQuantity === 0) {
      this.selectedQuantity = 1;
    }
    
    // If unchecked, reset quantity
    if (!this.selected) {
      this.selectedQuantity = 0;
    }
    
    this.dispatchEvent(new CustomEvent('item-selection-changed', {
      detail: {
        lineItemId: this.lineItem.id,
        selected: this.selected,
        quantity: this.selectedQuantity
      },
      bubbles: true,
      composed: true
    }));
  }

  private handleQuantityChange(e: Event) {
    const input = e.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    
    // Validate input
    if (isNaN(value) || value < 0) {
      value = 0; // Allow zero for deselection
    } else {
      // Get the max allowed value, which includes current selection
      const maxAllowed = this.remainingQuantity + (this.selected ? this.selectedQuantity : 0);
      if (value > maxAllowed) {
        value = maxAllowed;
      }
    }
    
    // If value is 0, deselect the item
    if (value === 0 && this.selected) {
      this.selected = false;
    } else if (value > 0 && !this.selected) {
      // If value is greater than 0 and not selected, select it
      this.selected = true;
    }
    
    // Only update and dispatch if the value actually changed
    if (this.selectedQuantity !== value) {
      this.selectedQuantity = value;
      
      this.dispatchEvent(new CustomEvent('item-quantity-changed', {
        detail: {
          lineItemId: this.lineItem.id,
          selected: this.selected,
          quantity: this.selectedQuantity
        },
        bubbles: true,
        composed: true
      }));
    }
  }

  render() {
    const name = this.lineItem.name[this.locale] || Object.values(this.lineItem.name)[0];
    // Calculate the max value including the currently selected quantity for this item
    const maxQuantity = this.remainingQuantity + (this.selected ? this.selectedQuantity : 0);
    
    return html`
      <div class="split-item">
        <input 
          type="checkbox" 
          class="item-checkbox" 
          ?checked="${this.selected}"
          @change="${this.handleCheckboxChange}"
          ?disabled="${maxQuantity === 0 && this.selectedQuantity === 0}"
        >
        
        <div class="item-details">
          <p class="item-name">${name}</p>
          <p class="item-sku">SKU: ${this.lineItem.variant.sku}</p>
        </div>
        
        <div class="quantity-control ${!this.selected ? 'disabled' : ''}">
          <input 
            type="number" 
            class="quantity-input" 
            min="1" 
            max="${maxQuantity}" 
            .value="${this.selectedQuantity}"
            @input="${this.handleQuantityChange}"
            ?disabled="${!this.selected}"
          >
          <span class="quantity-max">Max: ${maxQuantity}</span>
        </div>
      </div>
    `;
  }
} 