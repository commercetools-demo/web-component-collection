import type { Cart } from '@commercetools/platform-sdk';
import { LitElement, html, css } from 'lit';
import './address-table';
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
  country: string;
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
      font-family: var(--address-section-font-family, sans-serif);
      padding: var(--address-section-padding, 20px);
    }
    
    .dropzone {
      border: var(--dropzone-border, 2px dashed #ccc);
      border-radius: var(--dropzone-border-radius, 8px);
      padding: var(--dropzone-padding, 40px 20px);
      text-align: var(--dropzone-text-align, center);
      margin-bottom: var(--dropzone-margin-bottom, 20px);
      transition: var(--dropzone-transition, all 0.3s ease);
      background-color: var(--dropzone-background-color, #f9f9f9);
      cursor: var(--dropzone-cursor, pointer);
    }
    
    .dropzone.dragging {
      border-color: var(--dropzone-dragging-border-color, #3f51b5);
      background-color: var(--dropzone-dragging-background-color, rgba(63, 81, 181, 0.1));
    }
    
    .dropzone-icon {
      font-size: var(--dropzone-icon-font-size, 48px);
      color: var(--dropzone-icon-color, #3f51b5);
      margin-bottom: var(--dropzone-icon-margin-bottom, 10px);
    }
    
    .dropzone-text {
      margin-bottom: var(--dropzone-text-margin-bottom, 15px);
      font-size: var(--dropzone-text-font-size, 16px);
      color: var(--dropzone-text-color, #555);
    }
    
    .file-input {
      display: var(--file-input-display, none);
    }
    
    .browse-button {
      background-color: var(--browse-button-background-color, #3f51b5);
      color: var(--browse-button-color, white);
      border: var(--browse-button-border, none);
      padding: var(--browse-button-padding, 8px 16px);
      border-radius: var(--browse-button-border-radius, 4px);
      cursor: var(--browse-button-cursor, pointer);
      font-size: var(--browse-button-font-size, 14px);
      margin-top: var(--browse-button-margin-top, 10px);
    }
    
    .browse-button:hover {
      background-color: var(--browse-button-hover-background-color, #303f9f);
    }
    
    .file-info {
      margin-top: var(--file-info-margin-top, 15px);
      font-size: var(--file-info-font-size, 14px);
      color: var(--file-info-color, #666);
    }
    
    .error-message {
      color: var(--error-message-color, #d32f2f);
      margin: var(--error-message-margin, 15px 0);
      padding: var(--error-message-padding, 10px);
      background-color: var(--error-message-background-color, rgba(211, 47, 47, 0.1));
      border-radius: var(--error-message-border-radius, 4px);
    }
    
    .submit-button {
      background-color: var(--submit-button-background-color, #4caf50);
      color: var(--submit-button-color, white);
      border: var(--submit-button-border, none);
      padding: var(--submit-button-padding, 10px 20px);
      border-radius: var(--submit-button-border-radius, 4px);
      cursor: var(--submit-button-cursor, pointer);
      font-size: var(--submit-button-font-size, 16px);
      margin-top: var(--submit-button-margin-top, 20px);
    }
    
    .submit-button:hover {
      background-color: var(--submit-button-hover-background-color, #388e3c);
    }
    
    .submit-button:disabled {
      background-color: var(--submit-button-disabled-background-color, #cccccc);
      cursor: var(--submit-button-disabled-cursor, not-allowed);
    }

    button {
      background-color: var(--button-background-color, #3f51b5);
      color: var(--button-color, white);
      border: var(--button-border, none);
      padding: var(--button-padding, 8px 16px);
      border-radius: var(--button-border-radius, 4px);
      cursor: var(--button-cursor, pointer);
      font-size: var(--button-font-size, 14px);
    }
    
    button:hover {
      background-color: var(--button-hover-background-color, #303f9f);
    }
    
    button:disabled {
      background-color: var(--button-disabled-background-color, #cccccc);
      cursor: var(--button-disabled-cursor, not-allowed);
    }
    
    .button-container {
      margin-top: var(--button-container-margin-top, 24px);
      display: var(--button-container-display, flex);
      justify-content: var(--button-container-justify-content, flex-end);
    }

    .template-link {
      display: inline-block;
      margin-top: 10px;
      margin-bottom: 20px;
      color: var(--template-link-color, #3f51b5);
      text-decoration: underline;
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
    this.fileName = file.name;
    this.hasError = false;
    this.errorMessage = '';
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        this.csvData = this.parseCSV(content);
        
        // Dispatch csv-parsed event with the addresses data
        this.dispatchEvent(new CustomEvent('csv-parsed', {
          detail: {
            addresses: this.csvData
          },
          bubbles: true,
          composed: true
        }));
        
        this.requestUpdate();
      } catch (error) {
        this.hasError = true;
        this.errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV file';
        this.requestUpdate();
      }
    };
    
    reader.onerror = () => {
      this.hasError = true;
      this.errorMessage = 'Failed to read file';
      this.requestUpdate();
    };
    
    reader.readAsText(file);
  }

  private parseCSV(csvContent: string): CsvRowData[] {
    try {
      // Split by lines and remove empty lines
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }
      
      // Get headers and validate required columns
      const headers = lines[0].split(',').map(header => header.trim());
      const requiredColumns = ['firstName', 'lastName', 'streetNumber', 'streetName', 'city', 'state', 'zipCode', 'country', 'quantity'];
      
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
    return this.csvData;
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
    if (this.csvData.length === 0) {
      this.hasError = true;
      this.errorMessage = 'No address data to submit';
      return;
    }
    
    try {
      // Map CSV data to address objects
      const addresses = this.csvData.map(row => {
        return {
          firstName: row.firstName,
          lastName: row.lastName,
          streetName: row.streetName,
          streetNumber: row.streetNumber,
          city: row.city,
          state: row.state,
          postalCode: row.zipCode,
          country: row.country,
          quantity: row.quantity
        };
      });
      
      // Dispatch csv-parsed event again (in case submit button is clicked)
      this.dispatchEvent(new CustomEvent('csv-parsed', {
        detail: {
          addresses: addresses
        },
        bubbles: true,
        composed: true
      }));
      
    } catch (error) {
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : 'Failed to submit address data';
    }
  }

  private getComponentPath(): string {
    try {
      
      // Fallback 1: Look for the component's script tag
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && (src.includes('components.js') || src.includes('address-section'))) {
          // Get the directory of the script
          const baseUrl = src.substring(0, src.lastIndexOf('/') + 1);
          return `${baseUrl}template.csv`;
        }
      }
      
      // Fallback 2: Use the current document URL
      const baseUrl = new URL('./', window.location.href).href;
      return `${baseUrl}template.csv`;
    } catch (e) {
      console.warn('Failed to determine component path:', e);
      // Ultimate fallback - just use a relative path
      return 'template.csv';
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
            <small>Accepted format: .csv with columns for firstName, lastName, streetNumber, streetName, city, state, zipCode, country, quantity</small>
          </div>
          <input 
            type="file" 
            class="file-input" 
            accept=".csv" 
            @change=${this.handleFileInput}
          />
          <button class="browse-button">Browse Files</button>
        </div>
        
        <a href="${this.getComponentPath()}" download class="template-link">Download Template</a>
        
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
      </div>
    `;
  }
}

customElements.define('split-shipping-address-section', SplitShippingAddressSection); 