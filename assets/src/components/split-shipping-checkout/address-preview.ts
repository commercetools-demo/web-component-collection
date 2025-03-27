import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Address } from '../../types/checkout';

@customElement('address-preview')
export class AddressPreview extends LitElement {
  @property({ type: Object }) address: Address = {} as Address;
  @property({ type: Boolean }) showRadio = false;
  @property({ type: Boolean }) showEdit = false;
  @property({ type: Boolean }) selected = false;
  @property({ type: String }) locale = 'en-US';
  @property({ type: String }) addressId = '';
  @property({ type: String }) radioGroupName = 'address-radio';

  static styles = css`
    :host {
      display: block;
      --address-border-color: #e0e0e0;
      --address-background-color: #ffffff;
      --address-text-color: #333333;
      --address-selected-border-color: #3366ff;
      --address-selected-background-color: #f0f5ff;
      --edit-button-color: #3366ff;
    }

    .address-box {
      padding: 1rem;
      border: 1px solid var(--address-border-color);
      border-radius: 4px;
      background-color: var(--address-background-color);
      color: var(--address-text-color);
      position: relative;
      margin-bottom: 1rem;
      transition: all 0.2s ease;
    }

    .address-box.selected {
      border-color: var(--address-selected-border-color);
      background-color: var(--address-selected-background-color);
    }

    .address-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .address-field {
      margin: 0;
    }

    .radio-container {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .edit-button {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      color: var(--edit-button-color);
      cursor: pointer;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
    }

    .edit-button:hover {
      text-decoration: underline;
    }
  `;

  private handleRadioChange(e: Event) {
    const radio = e.target as HTMLInputElement;
    if (radio.checked) {
      this.selected = true;
      this.dispatchEvent(new CustomEvent('address-selected', {
        detail: { address: this.address, addressId: this.addressId },
        bubbles: true,
        composed: true
      }));
    }
  }

  private handleEditClick() {
    this.dispatchEvent(new CustomEvent('edit-address', {
      detail: { address: this.address, addressId: this.addressId },
      bubbles: true,
      composed: true
    }));
  }

  private formatAddress() {
    const { firstName, lastName, company, streetName, streetNumber, city, state, postalCode, country } = this.address;
    const formattedName = [firstName, lastName].filter(Boolean).join(' ');
    const formattedStreet = [streetNumber, streetName].filter(Boolean).join(' ');
    const formattedCityState = [city, state, postalCode].filter(Boolean).join(', ');
    
    const countryName = country ? new Intl.DisplayNames([this.locale], { type: 'region' }).of(country) : '';
    
    return {
      formattedName,
      company,
      formattedStreet,
      formattedCityState,
      countryName
    };
  }

  render() {
    const { formattedName, company, formattedStreet, formattedCityState, countryName } = this.formatAddress();
    
    return html`
      <div class="address-box ${this.selected ? 'selected' : ''}">
        ${this.showRadio ? html`
          <div class="radio-container">
            <input 
              type="radio" 
              name="${this.radioGroupName}" 
              id="address-${this.addressId}" 
              ?checked="${this.selected}"
              @change="${this.handleRadioChange}"
            >
            <label for="address-${this.addressId}">Ship to this address</label>
          </div>
        ` : ''}
        
        ${this.showEdit ? html`
          <button class="edit-button" @click="${this.handleEditClick}">Edit</button>
        ` : ''}
        
        <div class="address-content">
          <p class="address-field">${formattedName}</p>
          ${company ? html`<p class="address-field">${company}</p>` : ''}
          <p class="address-field">${formattedStreet}</p>
          <p class="address-field">${formattedCityState}</p>
          <p class="address-field">${countryName}</p>
        </div>
      </div>
    `;
  }
} 