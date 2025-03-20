import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

// Define CSV row data interface
interface CsvRowData {
  firstName: string;
  lastName: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  quantity: number;
}

export default class AddressTable extends LitElement {
  static properties = {
    addresses: { type: Array },
    editable: { type: Boolean }
  };

  addresses: CsvRowData[] = [];
  editable: boolean = true;

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
    if (address.firstName === '' || address.lastName === '' || address.streetNumber === '' || address.streetName === '' || address.city === '' || address.state === '' || address.zipCode === '' || address.country === '') {
      return false;
    }
    return true;
  }

  // Method to add a new row to the addresses array
  private addRow() {
    const formElements = this.shadowRoot?.querySelectorAll<HTMLInputElement>('.add-row-form input');
    
    if (!formElements) return;
    
    const newAddress: CsvRowData = {
      firstName: '',
      lastName: '',
      streetNumber: '',
      streetName: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      quantity: 1
    };
    
    // Populate the new address object with form values
    formElements.forEach(input => {
      const field = input.name as keyof CsvRowData;
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
      this.errorMessage = 'Invalid address';
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
              <th>First Name</th>
              <th>Last Name</th>
              <th>Street Number</th>
              <th>Street Name</th>
              <th>City</th>
              <th>State</th>
              <th>Zip Code</th>
              <th>Country</th>
              <th>Quantity</th>
              ${this.editable ? html`<th></th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${this.addresses.map((row, index) => html`
              <tr>
                <td>${row.firstName}</td>
                <td>${row.lastName}</td>
                <td>${row.streetNumber}</td>
                <td>${row.streetName}</td>
                <td>${row.city}</td>
                <td>${row.state}</td>
                <td>${row.zipCode}</td>
                <td>${row.country}</td>
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
            <h4>Add New Address</h4>
            <div class="add-row-form">
              <input type="text" name="firstName" placeholder="First Name" required class="col-span-1">
              <input type="text" name="lastName" placeholder="Last Name" required class="col-span-1">
              <input type="text" name="streetNumber" placeholder="Street Number" required class="col-span-1">
              <input type="text" name="streetName" placeholder="Street Name" required class="col-span-1">
              <input type="text" name="city" placeholder="City" required class="col-span-1">
              <input type="text" name="state" placeholder="State" required>
              <input type="text" name="zipCode" placeholder="Zip Code" required>
              <input type="text" name="country" placeholder="Country" required> 
              <input type="number" name="quantity" placeholder="Quantity" value="1" min="1" required>
              
              <button class="add-row-button" @click=${this.addRow}>
                Add Row
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