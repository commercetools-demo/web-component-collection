import './selector-group';
import './selector-button';

interface Attribute {
  name: string;
  value: any;
}

interface ProductVariant {
  id: number;
  sku: string;
  attributes?: Attribute[];
  prices?: any[];
  images?: any[];
  availability?: any;
}

interface ProductProjection {
  id: string;
  version: number;
  name?: { [key: string]: string };
  description?: { [key: string]: string };
  masterVariant: ProductVariant;
  variants: ProductVariant[];
  productType?: any;
}

interface SelectorOption {
  value: any;
  selected: boolean;
  disabled: boolean;
}

class StepVariantSelector extends HTMLElement {
  private baseUrl: string = '';
  private sku: string = '';
  private locale: string = 'en-US';
  private selectors: string[] = [];
  private product: ProductProjection | null = null;
  private productType: any = null;
  private allVariants: ProductVariant[] = [];
  private selectedValues: Map<string, any> = new Map();
  private shadow: ShadowRoot;
  private lastSelectedVariant: ProductVariant | null = null;
  private dataLoaded: boolean = false;
  private initialized: boolean = false;
  private dataIsLoading: boolean = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['baseurl', 'sku', 'selectors', 'locale'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'baseurl':
          this.baseUrl = newValue;
          this.dataLoaded = false;
          break;
        case 'sku':
          if (!this.initialized) {
            this.sku = newValue;
            this.dataLoaded = false;
          } else {
            console.warn('SKU changes after initialization are ignored. Component must be recreated to use a different SKU.');
          }
          break;
        case 'selectors':
          try {
            this.selectors = JSON.parse(newValue);
          } catch (e) {
            console.error('Invalid selectors format. Expected JSON array of strings.', e);
            this.selectors = [];
          }
          this.dataLoaded = false;
          break;
        case 'locale':
          this.locale = newValue;
          break;
      }
      
      // Only fetch and render if not initialized or if the change is not for sku
      // And only if we're not already loading data
      if ((!this.initialized || name !== 'sku') && !this.dataIsLoading) {
        this.fetchAndRenderVariants();
      }
    }
  }

  connectedCallback() {
    if (!this.dataLoaded && !this.dataIsLoading) {
      this.fetchAndRenderVariants();
    }
    this.addEventListener('group-selection-changed', this.handleGroupSelectionChanged as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('group-selection-changed', this.handleGroupSelectionChanged as EventListener);
  }

  private async fetchAndRenderVariants() {
    if (!this.baseUrl || !this.sku) return;
    
    // Prevent multiple concurrent API calls
    if (this.dataIsLoading) {
      console.log('Data is already loading, skipping duplicate request');
      return;
    }
    
    this.dataIsLoading = true;
    this.renderLoading(); // Show loading indicator

    try {
      const url = new URL(`${this.baseUrl}/products/sku/${this.sku}`);
      const response = await fetch(url.toString());
      
      if (!response.ok) throw new Error('Failed to fetch product data');

      this.product = await response.json();
      await this.fetchProductType();
      this.processProductData();
      this.dataLoaded = true;
      this.initialized = true;
      this.render();
    } catch (error) {
      console.error('Error fetching product data:', error);
      this.renderError();
    } finally {
      this.dataIsLoading = false;
    }
  }

  private async fetchProductType() {
    if (!this.product?.productType?.id) return;
    
    try {
      const url = new URL(`${this.baseUrl}/product-types/${this.product.productType.id}`);
      const response = await fetch(url.toString());
      
      if (!response.ok) throw new Error('Failed to fetch product type data');

      this.productType = await response.json();
    } catch (error) {
      console.error('Error fetching product type:', error);
      this.productType = null;
    }
  }

  private processProductData() {
    if (!this.product) return;

    // Combine master variant and variants into allVariants
    this.allVariants = [this.product.masterVariant, ...this.product.variants];
    
    // Preselect buttons based on the initial SKU
    this.preselectButtonsForSku(this.sku);
  }

  private preselectButtonsForSku(sku: string) {
    // Find the variant that matches the SKU
    const variant = this.allVariants.find(v => v.sku === sku);
    
    if (!variant || !variant.attributes) {
      return;
    }
    
    // Clear any existing selections
    this.selectedValues.clear();
    
    // For each selector, find the matching attribute and set the selected value
    for (const selectorName of this.selectors) {
      const attribute = variant.attributes.find(attr => attr.name === selectorName);
      if (attribute) {
        this.selectedValues.set(selectorName, attribute.value);
      }
    }
    
    // Store this as the last selected variant
    this.lastSelectedVariant = variant;
    
    // Dispatch events to notify about the preselection
    // First, dispatch the variant-selection-changed event
    this.dispatchEvent(new CustomEvent('variant-selection-changed', {
      bubbles: true,
      composed: true,
      detail: {
        selectedValues: Object.fromEntries(this.selectedValues),
        selectedVariant: variant
      }
    }));
    
    // Then, dispatch the sku-selected event
    if (variant.sku) {
      this.dispatchEvent(new CustomEvent('sku-selected', {
        bubbles: true,
        composed: true,
        detail: {
          sku: variant.sku,
          variant: variant,
          product: this.product
        }
      }));
    }
  }

  private getDistinctAttributeValues(attributeName: string, filteredVariants: ProductVariant[]): any[] {
    const values = new Set<string>();
    
    filteredVariants.forEach(variant => {
      const attribute = variant.attributes?.find(attr => attr.name === attributeName);
      if (attribute) {
        values.add(JSON.stringify(attribute.value));
      }
    });
    
    return Array.from(values).map(v => JSON.parse(v));
  }

  private getFilteredVariants(level: number): ProductVariant[] {
    if (level === 0) return this.allVariants;
    
    return this.allVariants.filter(variant => {
      for (let i = 0; i < level; i++) {
        const selectorName = this.selectors[i];
        const selectedValue = this.selectedValues.get(selectorName);
        
        if (selectedValue === undefined) continue;
        
        const attribute = variant.attributes?.find(attr => attr.name === selectorName);
        if (!attribute || JSON.stringify(attribute.value) !== JSON.stringify(selectedValue)) {
          return false;
        }
      }
      return true;
    });
  }

  private handleGroupSelectionChanged(e: Event) {
    const customEvent = e as CustomEvent;
    const { selectorName, value } = customEvent.detail;
    
    // Update selected value for this selector
    this.selectedValues.set(selectorName, value);
    
    // Clear all selections for levels below this one
    const currentLevel = this.selectors.indexOf(selectorName);
    for (let i = currentLevel + 1; i < this.selectors.length; i++) {
      this.selectedValues.delete(this.selectors[i]);
    }
    
    this.render();
    
    // Get the selected variant
    const selectedVariant = this.getSelectedVariant();
    
    // Dispatch a custom event with the current selection
    this.dispatchEvent(new CustomEvent('variant-selection-changed', {
      bubbles: true,
      composed: true,
      detail: {
        selectedValues: Object.fromEntries(this.selectedValues),
        selectedVariant
      }
    }));
    
    // If a complete variant is selected (all selectors have values) and it has a SKU
    // and it's different from the last selected variant, emit a sku-selected event
    if (selectedVariant && selectedVariant.sku && 
        (!this.lastSelectedVariant || this.lastSelectedVariant.sku !== selectedVariant.sku)) {
      this.lastSelectedVariant = selectedVariant;
      
      this.dispatchEvent(new CustomEvent('sku-selected', {
        bubbles: true,
        composed: true,
        detail: {
          sku: selectedVariant.sku,
          variant: selectedVariant,
          product: this.product
        }
      }));
    }
  }

  private getSelectedVariant(): ProductVariant | null {
    // Get the list of selectors that actually have values in at least one variant
    const validSelectors = this.selectors.filter(selectorName => 
      this.allVariants.some(variant => 
        variant.attributes?.some(attr => attr.name === selectorName)
      )
    );
    
    // Check if we have selected values for all valid selectors
    const hasAllValidSelections = validSelectors.every(selector => 
      this.selectedValues.has(selector)
    );
    
    if (!hasAllValidSelections) return null;
    
    return this.allVariants.find(variant => {
      // Only check the selectors that have values
      for (const selectorName of validSelectors) {
        const selectedValue = this.selectedValues.get(selectorName);
        const attribute = variant.attributes?.find(attr => attr.name === selectorName);
        
        // If this variant doesn't have this attribute or the value doesn't match, skip this variant
        if (!attribute || JSON.stringify(attribute.value) !== JSON.stringify(selectedValue)) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  private getAttributeLabel(attributeName: string): string {
    if (!this.productType?.attributes) return attributeName;

    const attribute = this.productType.attributes.find((attr: any) => attr.name === attributeName);
    if (!attribute?.label) return attributeName;

    // Try to get the localized label
    if (typeof attribute.label === 'object') {
      return attribute.label[this.locale] || attribute.label['en-US'] || attributeName;
    }

    return attribute.label;
  }

  private render() {
    if (!this.product || this.selectors.length === 0) {
      this.shadow.innerHTML = '<div>No product data or selectors available</div>';
      return;
    }

    const styles = `
      <style>
        :host {
          display: block;
          font-family: var(--step-variant-selector-font-family, system-ui, -apple-system, sans-serif);
          
          /* CSS Variables for styling - only use fallback values, don't define them here */
          /* This allows the variables to be set from outside */
        }
        
        .variant-selector {
          margin-bottom: var(--step-variant-selector-margin-bottom, 20px);
          background: var(--step-variant-selector-background, transparent);
          padding: var(--step-variant-selector-padding, 0);
          border: var(--step-variant-selector-border, none);
          border-radius: var(--step-variant-selector-border-radius, 0);
        }
        
        .product-info {
          margin-bottom: var(--product-info-margin-bottom, 16px);
        }
        
        .product-name {
          font-size: var(--product-name-font-size, 1.2em);
          font-weight: var(--product-name-font-weight, bold);
          color: var(--product-name-color, inherit);
        }
        
        .selected-variant-info {
          margin-top: var(--selected-variant-info-margin-top, 16px);
          padding: var(--selected-variant-info-padding, 12px);
          background: var(--selected-variant-info-background, #f5f5f5);
          border-radius: var(--selected-variant-info-border-radius, 4px);
          border: var(--selected-variant-info-border, none);
          color: var(--selected-variant-info-color, inherit);
        }
        
        .error {
          color: var(--error-color, red);
          padding: var(--error-padding, 8px);
          background: var(--error-background, transparent);
          border: var(--error-border, none);
          border-radius: var(--error-border-radius, 0);
        }
      </style>
    `;

    let selectorGroupsHtml = '';
    
    // Filter selectors to only include those that have values in at least one variant
    const validSelectors = this.selectors.filter(selectorName => {
      // Check if this selector has any values in any variant
      return this.allVariants.some(variant => 
        variant.attributes?.some(attr => attr.name === selectorName)
      );
    });
    // Only loop through selectors that have values
    for (let i = 0; i < validSelectors.length; i++) {
      const selectorName = validSelectors[i];
      const selectorLabel = this.getAttributeLabel(selectorName);
      
      // For filtering, we need to use the original index in the selectors array
      const originalIndex = this.selectors.indexOf(selectorName);
      const filteredVariants = this.getFilteredVariants(originalIndex);
      const distinctValues = this.getDistinctAttributeValues(selectorName, filteredVariants);
      
      // Check if previous selector in the valid selectors list has a value selected
      const isDisabled = i > 0 && !this.selectedValues.has(validSelectors[i - 1]);
      
      const options: SelectorOption[] = distinctValues.map(value => {
        return {
          value,
          selected: JSON.stringify(this.selectedValues.get(selectorName)) === JSON.stringify(value),
          disabled: isDisabled
        };
      });

      selectorGroupsHtml += `
        <selector-group
          selector-name="${selectorName}"
          selector-label="${selectorLabel}"
          options='${JSON.stringify(options)}'>
        </selector-group>
      `;
    }

    let selectedVariantInfoHtml = '';
    const selectedVariant = this.getSelectedVariant();
    if (selectedVariant) {
      selectedVariantInfoHtml = `
        <div class="selected-variant-info">
          <div>Selected SKU: ${selectedVariant.sku}</div>
        </div>
      `;
    }

    this.shadow.innerHTML = `
      ${styles}
      <div class="variant-selector">
        ${selectorGroupsHtml}
        ${selectedVariantInfoHtml}
      </div>
    `;
  }

  private renderError() {
    this.shadow.innerHTML = `
      <style>
        :host {
          --error-color: red;
          --error-padding: 8px;
          --error-background: transparent;
          --error-border: none;
          --error-border-radius: 0;
        }
        
        .error {
          color: var(--error-color);
          padding: var(--error-padding);
          background: var(--error-background);
          border: var(--error-border);
          border-radius: var(--error-border-radius);
        }
      </style>
      <div class="error">Failed to load product data</div>
    `;
  }

  // Add a method to render a loading indicator
  private renderLoading() {
    const styles = `
      <style>
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: var(--step-variant-selector-font-family, system-ui, -apple-system, sans-serif);
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid var(--loading-spinner-color, #3498db);
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin-right: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          color: var(--loading-text-color, inherit);
        }
      </style>
    `;

    this.shadow.innerHTML = `
      ${styles}
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading variant data...</div>
      </div>
    `;
  }
}

customElements.define('step-variant-selector', StepVariantSelector);

export default StepVariantSelector; 