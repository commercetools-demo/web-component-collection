import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

// Define our own Address interface to avoid read-only properties
interface AddressData {
  id?: string;
  country: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  quantity?: number;
  [key: string]: any;
}

// Define CSV row data interface
interface CsvRowData {
  firstName: string;
  lastName: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  quantity: number;
}

interface Account {
  id: string;
  addresses?: AddressData[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  [key: string]: any;
}

export default class SplitShippingAddressSection extends LitElement {
  static properties = {
    cart: { type: Object },
    account: { type: Object },
    cartItemId: { type: String, attribute: 'cart-item-id' },
    locale: { type: String }
  };

  cart: Cart | null = null;
  account: Account | null = null;
  cartItemId: string = '';
  locale: string = 'en-US';
  
  private isDragging: boolean = false;
  private csvData: CsvRowData[] = [];
  private hasError: boolean = false;
  private errorMessage: string = '';
  private fileName: string = '';

  static styles = css`
    .address-section {
      font-family: sans-serif;
      padding: 20px;
    }
    
    .dropzone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      margin-bottom: 20px;
      transition: all 0.3s ease;
      background-color: #f9f9f9;
      cursor: pointer;
    }
    
    .dropzone.dragging {
      border-color: #3f51b5;
      background-color: rgba(63, 81, 181, 0.1);
    }
    
    .dropzone-icon {
      font-size: 48px;
      color: #3f51b5;
      margin-bottom: 10px;
    }
    
    .dropzone-text {
      margin-bottom: 15px;
      font-size: 16px;
      color: #555;
    }
    
    .file-input {
      display: none;
    }
    
    .browse-button {
      background-color: #3f51b5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
    }
    
    .browse-button:hover {
      background-color: #303f9f;
    }
    
    .template-link {
      display: block;
      margin-top: 10px;
      color: #3f51b5;
      text-decoration: underline;
      cursor: pointer;
      font-size: 14px;
    }
    
    .template-link:hover {
      color: #303f9f;
    }
    
    .file-info {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
    
    .error-message {
      color: #d32f2f;
      margin-top: 10px;
      font-size: 14px;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    
    .data-table th, .data-table td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    
    .data-table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    .data-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    .data-table tr:hover {
      background-color: #f5f5f5;
    }
    
    .button-container {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
    
    button {
      background-color: #3f51b5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    button:hover {
      background-color: #303f9f;
    }
    
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this.setupDragAndDropListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeDragAndDropListeners();
  }

  private setupDragAndDropListeners() {
    // These listeners will be properly attached in firstUpdated
  }

  private removeDragAndDropListeners() {
    const dropzone = this.shadowRoot?.querySelector('.dropzone');
    if (dropzone) {
      dropzone.removeEventListener('dragover', this.handleDragOver as EventListener);
      dropzone.removeEventListener('dragleave', this.handleDragLeave as EventListener);
      dropzone.removeEventListener('drop', this.handleDrop as EventListener);
    }
  }

  firstUpdated() {
    const dropzone = this.shadowRoot?.querySelector('.dropzone');
    const fileInput = this.shadowRoot?.querySelector('.file-input');
    
    if (dropzone) {
      dropzone.addEventListener('dragover', this.handleDragOver.bind(this) as EventListener);
      dropzone.addEventListener('dragleave', this.handleDragLeave.bind(this) as EventListener);
      dropzone.addEventListener('drop', this.handleDrop.bind(this) as EventListener);
      dropzone.addEventListener('click', () => {
        (fileInput as HTMLInputElement)?.click();
      });
    }
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = true;
    this.requestUpdate();
  }

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
    this.requestUpdate();
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this.processFile(e.dataTransfer.files[0]);
    }
  }

  private handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File) {
    // Check if file is CSV
    if (!file.name.endsWith('.csv')) {
      this.hasError = true;
      this.errorMessage = 'Please select a CSV file';
      this.requestUpdate();
      return;
    }

    this.fileName = file.name;
    this.hasError = false;
    this.errorMessage = '';
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        this.parseCsvData(csvContent);
      } catch (error) {
        console.error('Error reading CSV file:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to read CSV file';
      }
      this.requestUpdate();
    };
    
    reader.onerror = () => {
      this.hasError = true;
      this.errorMessage = 'Failed to read file';
      this.requestUpdate();
    };
    
    reader.readAsText(file);
  }

  private parseCsvData(csvContent: string) {
    try {
      // Split by lines and remove empty lines
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }
      
      // Get headers and validate required columns
      const headers = lines[0].split(',').map(header => header.trim());
      const requiredColumns = ['firstName', 'lastName', 'streetNumber', 'streetName', 'city', 'state', 'zipCode', 'quantity'];
      
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }
      
      // Parse data rows
      this.csvData = [];
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          console.warn(`Skipping row ${i + 1}: column count mismatch`);
          continue;
        }
        
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        
        // Convert quantity to number
        rowData.quantity = parseInt(rowData.quantity, 10) || 1;
        
        this.csvData.push(rowData as CsvRowData);
      }
      
      if (this.csvData.length === 0) {
        throw new Error('No valid data rows found in CSV file');
      }
      
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV data';
      this.csvData = [];
    }
  }

  // Helper function to properly parse CSV lines with quoted values
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  }

  private submitAddressData() {
    if (this.csvData.length === 0 || !this.cartItemId) {
      alert('Please upload a valid CSV file first');
      return;
    }

    try {
      // Convert CSV data to address data format
      const addresses: AddressData[] = this.csvData.map((row, index) => ({
        id: `csv-${index}`,
        country: 'US', // Default to US since we have state
        firstName: row.firstName,
        lastName: row.lastName,
        streetName: row.streetName,
        streetNumber: row.streetNumber,
        city: row.city,
        state: row.state,
        postalCode: row.zipCode,
        quantity: row.quantity
      }));

      // Dispatch event to notify that addresses have been selected
      this.dispatchEvent(new CustomEvent('addresses-selected', {
        detail: {
          cartItemId: this.cartItemId,
          addresses: addresses
        },
        bubbles: true,
        composed: true
      }));

      // Show success message
      alert('Address data submitted successfully');
    } catch (error) {
      console.error('Error submitting address data:', error);
      alert('Failed to submit address data');
    }
  }

  render() {
    return html`
      <div class="address-section">
        <h4>Upload Shipping Addresses</h4>
        
        <div class="dropzone ${this.isDragging ? 'dragging' : ''}">
          <div class="dropzone-icon">📁</div>
          <div class="dropzone-text">
            Drag & drop your CSV file here or click to browse
          </div>
          <div class="dropzone-text">
            <small>Accepted format: .csv with columns for firstName, lastName, streetNumber, streetName, city, state, zipCode, quantity</small>
          </div>
          <input 
            type="file" 
            class="file-input" 
            accept=".csv" 
            @change=${this.handleFileInput}
          />
          <button class="browse-button">Browse Files</button>
        </div>
        
        <a href="/src/static/template.csv" download class="template-link">Download Template</a>
        
        ${this.fileName ? html`
          <div class="file-info">
            Selected file: ${this.fileName}
          </div>
        ` : ''}
        
        ${this.hasError ? html`
          <div class="error-message">
            ${this.errorMessage}
          </div>
        ` : ''}
        
        ${this.csvData.length > 0 ? html`
          <h4>Parsed Address Data</h4>
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
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${this.csvData.map(row => html`
                <tr>
                  <td>${row.firstName}</td>
                  <td>${row.lastName}</td>
                  <td>${row.streetNumber}</td>
                  <td>${row.streetName}</td>
                  <td>${row.city}</td>
                  <td>${row.state}</td>
                  <td>${row.zipCode}</td>
                  <td>${row.quantity}</td>
                </tr>
              `)}
            </tbody>
          </table>
          
          <div class="button-container">
            <button 
              id="address-submit"
              @click=${this.submitAddressData}
            >
              Continue with Uploaded Addresses
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('split-shipping-address-section', SplitShippingAddressSection); 