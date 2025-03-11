# Step Variant Selector

A customizable web component for selecting product variants in a step-by-step manner. This component is designed to work with commercetools product projection data.

## Features

- Step-by-step variant selection based on product attributes
- Dynamically filters available options based on previous selections
- Customizable selectors order
- Emits events when selections change
- Built with Web Components for framework-agnostic usage
- Fully customizable styling using CSS variables

## Components

The library consists of the following components:

1. `step-variant-selector`: The main component that handles the step-by-step variant selection
2. `selector-group`: A reusable component that groups related selector buttons
3. `selector-button`: A reusable button component for individual variant options

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/step-variant-selector.git

# Install dependencies
npm install

# Build the components
npm run build
```

## Usage

### Basic Usage

```html
<step-variant-selector
  baseurl="https://api.example.com"
  sku="product-123"
  selectors='["size", "color", "material"]'>
</step-variant-selector>
```

### Attributes

The `step-variant-selector` component accepts the following attributes:

- `baseurl` (required): The base URL of your API
- `sku` (required): The SKU of the product to fetch. **Note: The component will not react to changes in this attribute after initial load. To use a different SKU, you must create a new instance of the component.**
- `selectors` (required): A JSON array of strings representing the attribute names to use as selectors, in the order they should be displayed
- `locale` (optional): The locale to use for product information, defaults to 'en-US'

### Behavior Notes

1. **SKU Changes**: The component ignores changes to the `sku` attribute after it has been initialized. This is by design to prevent unexpected behavior when the product data changes. If you need to display a different product, you should create a new instance of the component.

2. **Dynamic Updates**: While the `sku` attribute is fixed after initialization, other attributes like `selectors` and `locale` can be updated dynamically.

3. **Automatic Preselection**: When the component loads with a specific SKU, it automatically preselects all the buttons that correspond to the attributes of that SKU. This provides a better user experience by showing the complete selection for the current SKU without requiring user interaction.

### Events

The component emits the following events:

- `variant-selection-changed`: Fired when a variant selection changes. The event detail contains:
  - `selectedValues`: An object with the currently selected values
  - `selectedVariant`: The complete variant object that matches all selected values, or null if no complete selection has been made

- `sku-selected`: Fired when a complete variant with a SKU is selected. This event is only fired when all selectors have values and a matching variant is found. The event detail contains:
  - `sku`: The SKU of the selected variant
  - `variant`: The complete variant object
  - `product`: The product projection object

### Example Event Handling

```javascript
// Listen for any selection changes
document.querySelector('step-variant-selector').addEventListener('variant-selection-changed', (event) => {
});

// Listen specifically for when a SKU is selected
document.querySelector('step-variant-selector').addEventListener('sku-selected', (event) => {
  // You can use this event to add the product to cart, update pricing, etc.
  addToCart(event.detail.sku, 1);
});
```

## Styling with CSS Variables

All components expose CSS variables for customization. You can override these variables to customize the appearance of the components.

### Step Variant Selector Variables

```css
step-variant-selector {
  /* Main component styling */
  --step-variant-selector-font-family: system-ui, -apple-system, sans-serif;
  --step-variant-selector-margin-bottom: 20px;
  --step-variant-selector-background: transparent;
  --step-variant-selector-padding: 0;
  --step-variant-selector-border: none;
  --step-variant-selector-border-radius: 0;
  
  /* Product info styling */
  --product-info-margin-bottom: 16px;
  --product-name-font-size: 1.2em;
  --product-name-font-weight: bold;
  --product-name-color: inherit;
  
  /* Selected variant info styling */
  --selected-variant-info-margin-top: 16px;
  --selected-variant-info-padding: 12px;
  --selected-variant-info-background: #f5f5f5;
  --selected-variant-info-border-radius: 4px;
  --selected-variant-info-border: none;
  --selected-variant-info-color: inherit;
  
  /* Loading indicator styling */
  --loading-spinner-color: #3498db;
  --loading-text-color: inherit;
  
  /* Error styling */
  --error-color: red;
  --error-padding: 8px;
  --error-background: transparent;
  --error-border: none;
  --error-border-radius: 0;
}
```

### Selector Group Variables

```css
selector-group {
  --selector-group-margin-bottom: 16px;
  --selector-group-font-family: system-ui, -apple-system, sans-serif;
  
  --selector-group-label-font-weight: bold;
  --selector-group-label-margin-bottom: 8px;
  --selector-group-label-text-transform: capitalize;
  --selector-group-label-color: inherit;
  --selector-group-label-font-size: inherit;
  
  --selector-buttons-display: flex;
  --selector-buttons-flex-wrap: wrap;
  --selector-buttons-gap: 8px;
  --selector-buttons-justify-content: flex-start;
  --selector-buttons-align-items: center;
}
```

### Selector Button Variables

```css
selector-button {
  --selector-button-padding: 8px 16px;
  --selector-button-border: 1px solid #ccc;
  --selector-button-border-radius: 4px;
  --selector-button-background: #f5f5f5;
  --selector-button-color: inherit;
  --selector-button-font-family: system-ui, -apple-system, sans-serif;
  --selector-button-font-size: inherit;
  --selector-button-font-weight: normal;
  --selector-button-transition: all 0.2s;
  
  --selector-button-hover-background: #e9e9e9;
  --selector-button-hover-color: inherit;
  --selector-button-hover-border-color: #ccc;
  
  --selector-button-selected-background: #4a90e2;
  --selector-button-selected-color: white;
  --selector-button-selected-border-color: #3a80d2;
  
  --selector-button-disabled-opacity: 0.5;
}
```

### Example Styling

```html
<style>
  /* Custom blue theme */
  step-variant-selector {
    --step-variant-selector-font-family: 'Arial', sans-serif;
    --product-name-color: #2c3e50;
    --selected-variant-info-background: #ecf0f1;
    --selected-variant-info-border: 1px solid #bdc3c7;
  }
  
  selector-group {
    --selector-group-label-color: #3498db;
    --selector-group-label-font-size: 1.1em;
    --selector-buttons-gap: 12px;
  }
  
  selector-button {
    --selector-button-border-radius: 20px;
    --selector-button-background: #f8f9fa;
    --selector-button-border: 1px solid #e9ecef;
    
    --selector-button-selected-background: #3498db;
    --selector-button-selected-border-color: #2980b9;
    
    --selector-button-hover-background: #e9ecef;
  }
</style>

<step-variant-selector
  baseurl="https://api.example.com"
  sku="product-123"
  selectors='["size", "color", "material"]'>
</step-variant-selector>
```

## API Requirements

The component expects the API endpoint at `${baseUrl}/products/sku/${sku}` to return a commercetools product projection with the following structure:

```json
{
  "id": "123",
  "version": 1,
  "name": { "en": "Product Name" },
  "masterVariant": {
    "id": 1,
    "sku": "product-123-variant-1",
    "attributes": [
      { "name": "size", "value": "S" },
      { "name": "color", "value": "Red" }
    ]
  },
  "variants": [
    {
      "id": 2,
      "sku": "product-123-variant-2",
      "attributes": [
        { "name": "size", "value": "M" },
        { "name": "color", "value": "Red" }
      ]
    },
    // More variants...
  ]
}
```

## Demo

A demo is available in the `assets/demo.html` file. Open it in a browser to see the component in action.

## Browser Support

This component uses modern web standards and should work in all modern browsers that support Web Components.

## License

MIT

