import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Address } from '../../types/checkout';

@customElement('address-form')
export class AddressForm extends LitElement {
  @property({ type: Object }) address: Partial<Address> = {};
  @property({ type: Boolean }) isRequired = true;
  @property({ type: Array }) countries: string[] = [];
  @property({ type: String }) locale = 'en-US';
  @property({ type: String }) formId = '';

  @state() private isStateRequired = false;

  static styles = css`
    :host {
      display: block;
      --form-border-color: #e0e0e0;
      --form-focus-color: #3366ff;
      --form-error-color: #ff3366;
      --form-text-color: #333333;
      --form-label-color: #666666;
      --form-background-color: #ffffff;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--form-label-color);
    }

    input, select {
      display: block;
      padding: 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: var(--form-text-color);
      background-color: var(--form-background-color);
      border: 1px solid var(--form-border-color);
      border-radius: 4px;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    input:focus, select:focus {
      border-color: var(--form-focus-color);
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(51, 102, 255, 0.25);
    }

    .required::after {
      content: '*';
      color: var(--form-error-color);
      margin-left: 0.25rem;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .col {
      flex: 1;
      min-width: 200px;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 600px) {
      .row {
        flex-direction: column;
      }
    }
  `;

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const fieldName = target.name;
    const value = target.value;

    // Check if country is US to show state field
    if (fieldName === 'country' && value === 'US') {
      this.isStateRequired = true;
    } else if (fieldName === 'country') {
      this.isStateRequired = false;
    }

    // Update the address object
    this.address = {
      ...this.address,
      [fieldName]: value
    };

    // Dispatch change event for parent components
    this.dispatchEvent(new CustomEvent('address-changed', {
      detail: { address: this.address },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <form id="${this.formId}">
        <div class="row">
          <div class="col form-group">
            <label class="${this.isRequired ? 'required' : ''}" for="firstName-${this.formId}">First Name</label>
            <input
              type="text"
              id="firstName-${this.formId}"
              name="firstName"
              .value="${this.address.firstName || ''}"
              @input="${this.handleInput}"
              ?required="${this.isRequired}"
            >
          </div>
         <div class="col form-group">
            <label class="${this.isRequired ? 'required' : ''}" for="lastName-${this.formId}">Last Name</label>
            <input
              type="text"
              id="lastName-${this.formId}"
              name="lastName"
              .value="${this.address.lastName || ''}"
              @input="${this.handleInput}"
              ?required="${this.isRequired}"
            >
          </div>
        </div>

        <div class="row">
        <div class="col form-group">
          <label class="${this.isRequired ? 'required' : ''}" for="email-${this.formId}">Email Address</label>
          <input
            type="email"
            id="email-${this.formId}"
            name="email"
            .value="${this.address.email || ''}"
            @input="${this.handleInput}"
            ?required="${this.isRequired}"
          >
        </div>
        </div>

        <div class="row">
          <div class="col form-group">
            <label class="${this.isRequired ? 'required' : ''}" for="country-${this.formId}">Country</label>
            <select
            id="country-${this.formId}"
            name="country"
            .value="${this.address.country || ''}"
            @change="${this.handleInput}"
            ?required="${this.isRequired}"
          >
            <option value="" disabled selected>Select Country</option>
            ${this.countries.map(country => html`
              <option value="${country}" ?selected="${this.address.country === country}">${new Intl.DisplayNames([this.locale], { type: 'region' }).of(country)}</option>
            `)}
          </select>
        </div>
        ${this.isStateRequired ? html`
            <div class="col form-group">
              <label class="${this.isRequired ? 'required' : ''}" for="state-${this.formId}">State</label>
              <input
                type="text"
                id="state-${this.formId}"
                name="state"
                .value="${this.address.state || ''}"
              @input="${this.handleInput}"
              ?required="${this.isRequired}"
            >
          </div>
        ` : html`<div class="col form-group"></div>`}

        </div>

        
        <div class="row">
          <div class="col form-group">
            <label class="${this.isRequired ? 'required' : ''}" for="streetName-${this.formId}">Street Address</label>
            <input
              type="text"
              id="streetName-${this.formId}"
              name="streetName"
              .value="${this.address.streetName || ''}"
            @input="${this.handleInput}"
            ?required="${this.isRequired}"
          >
        </div>
        <div class="col form-group">
            <label class="${this.isRequired ? 'required' : ''}" for="streetNumber-${this.formId}">Street Number</label>
          <input
            type="text"
            id="streetNumber-${this.formId}"
            name="streetNumber"
            .value="${this.address.streetNumber || ''}"
            @input="${this.handleInput}"
            ?required="${this.isRequired}"
          >
        </div>
        </div>


        <div class="row">
          <div class="col form-group">
            <label class="${this.isRequired ? 'required' : ''}" for="postalCode-${this.formId}">Zip Code</label>
            <input
              type="text"
              id="postalCode-${this.formId}"
              name="postalCode"
              .value="${this.address.postalCode || ''}"
              @input="${this.handleInput}"
              ?required="${this.isRequired}"
            >
          </div>
           <div class="col form-group">
            <label class="${this.isRequired ? 'required' : ''}" for="city-${this.formId}">City</label>
            <input
              type="text"
              id="city-${this.formId}"
              name="city"
              .value="${this.address.city || ''}"
              @input="${this.handleInput}"
              ?required="${this.isRequired}"
            >
          </div>
        </div>


        <div class="row">
          <div class="col form-group">
            <label for="company-${this.formId}">Company (optional)</label>
            <input
              type="text"
              id="company-${this.formId}"
              name="company"
              .value="${this.address.company || ''}"
              @input="${this.handleInput}"
            >
          </div>
        </div>
      </form>
    `;
  }
} 