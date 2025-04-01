import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

interface AddressField {
  label: string;
}

interface AddressFields {
  [key: string]: AddressField;
}

// Define CSV row data interface
interface CsvRowData {
  [key: string]: string | number;
  quantity: number;
}

export default class AddressTable extends LitElement {
  static properties = {
    addresses: { type: Array },
    editable: { type: Boolean },
    addressFields: { type: Object },
    translations: { type: Object }
  };

  addresses: CsvRowData[] = [];
  editable: boolean = true;
  addressFields: AddressFields = {};
  translations: Record<string, string> = {};

  @state()
  errorMessage: string = '';
  
  static styles = css`
    .error-message {
      color: red;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: var(--data-table-margin-bottom, 20px);
    }
    
    .data-table th, .data-table td {
      border: var(--data-table-cell-border, 1px solid #ddd);
      padding: var(--data-table-cell-padding, 8px 12px);
      text-align: var(--data-table-cell-text-align, left);
    }
    
    .data-table th {
      background-color: var(--data-table-header-bg, #f2f2f2);
      color: var(--data-table-header-color, #333);
      font-weight: var(--data-table-header-font-weight, bold);
    }
    
    .data-table tr:nth-child(even) {
      background-color: var(--data-table-row-even-bg, #f9f9f9);
    }
    
    .data-table tr:hover {
      background-color: var(--data-table-row-hover-bg, #f5f5f5);
    }

    .add-row-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 20px;
      margin-bottom: 20px;
    }

    .add-row-form {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .add-row-form input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      flex-basis: 25%;
    }

    .add-row-button {
      background-color: var(--add-row-button-bg, #3f51b5);
      color: var(--add-row-button-color, white);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      grid-column: span 8;
      width: max-content;
      justify-self: end;
    }

    .add-row-button:hover {
      background-color: var(--add-row-button-hover-bg, #303f9f);
    }

    .remove-row-button {
      background-color: var(--remove-row-button-bg, #f44336);
      color: var(--remove-row-button-color, white);
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .remove-row-button:hover {
      background-color: var(--remove-row-button-hover-bg, #d32f2f);
    }
  `;

  constructor() {
    super();
  }

  validateAddress(address: CsvRowData): boolean {
    // Check all fields except quantity
    return Object.keys(this.addressFields).every(field => {
      return address[field] !== '';
    });
  }

  // Method to add a new row to the addresses array
  private addRow() {
    const formElements = this.shadowRoot?.querySelectorAll<HTMLInputElement>('.add-row-form input');
    
    if (!formElements) return;
    
    const newAddress: CsvRowData = {
      quantity: 1
    };

    // Initialize all fields from addressFields with empty strings
    Object.keys(this.addressFields).forEach(field => {
      newAddress[field] = '';
    });
    
    // Populate the new address object with form values
    formElements.forEach(input => {
      const field = input.name;
      if (field === 'quantity') {
        newAddress[field] = parseInt(input.value) || 1;
      } else {
        newAddress[field] = input.value;
      }
    });

    if (this.validateAddress(newAddress)) {
      this.errorMessage = '';
      // Add the new address and notify parent
      const updatedAddresses = [...this.addresses, newAddress];
      this.addresses = updatedAddresses;
      
      // Dispatch event to notify parent of address change
      this.dispatchEvent(new CustomEvent('addresses-updated', {
        detail: {
          addresses: this.addresses
        },
        bubbles: true,
        composed: true
      }));
      
      // Clear the form
      formElements.forEach(input => {
        input.value = '';
      });
    } else {
      this.errorMessage = this.translations["addressTable.error.invalidAddress"] || 'Invalid address';
    }
  }

  // Method to remove a row from the addresses array
  private removeRow(index: number) {
    // Create a new array without the item at the specified index
    const updatedAddresses = [...this.addresses.slice(0, index), ...this.addresses.slice(index + 1)];
    this.addresses = updatedAddresses;
    
    // Dispatch event to notify parent of address change
    this.dispatchEvent(new CustomEvent('addresses-updated', {
      detail: {
        addresses: this.addresses
      },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div>
        <table class="data-table">
          <thead>
            <tr>
              ${Object.entries(this.addressFields).map(([_, config]) => html`
                <th>${config.label}</th>
              `)}
              <th>${this.translations["addressTable.header.quantity"] || "Quantity"}</th>
              ${this.editable ? html`<th></th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${this.addresses.map((row, index) => html`
              <tr>
                ${Object.keys(this.addressFields).map(field => html`
                  <td>${row[field]}</td>
                `)}
                <td>${row.quantity}</td>
                ${this.editable ? html`
                  <td>
                    <button class="remove-row-button" @click=${() => this.removeRow(index)}>
                      X
                    </button>
                  </td>
                ` : ''}
              </tr>
            `)}
          </tbody>
        </table>
        
        ${this.editable ? html`
          <div class="add-row-container">
            <h4>${this.translations["addressTable.addNew.title"] || "Add New Address"}</h4>
            <div class="add-row-form">
              ${Object.entries(this.addressFields).map(([field, config]) => html`
                <input type="text" name="${field}" placeholder="${config.label}" required>
              `)}
              <input type="number" name="quantity" placeholder="${this.translations["addressTable.placeholder.quantity"] || "Quantity"}" value="1" min="1" required>
              
              <button class="add-row-button" @click=${this.addRow}>
                ${this.translations["addressTable.button.addRow"] || "Add Row"}
              </button>
            </div>
            <p class="error-message">${this.errorMessage}</p>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('address-table', AddressTable); 