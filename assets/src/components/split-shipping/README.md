# Split Shipping Component

A web component for managing split shipping functionality in a commercetools-based application.

## Features

- Button that opens a modal for split shipping configuration
- Address selection and management
- Shipping method selection
- Collapsible sections for easy navigation
- Custom styling via CSS variables
- Event-based communication
- Integration with customer account addresses
- **Customizable address fields** for flexibility

## Usage

```html
<!-- Basic usage -->
<split-shipping
  base-url="https://api.example.com"
  locale="en-US"
  cart-id="cart-123"
  cart-item-id="line-item-456"
  account-id="customer-789"
>
  Split Shipping
</split-shipping>

<!-- With custom button content -->
<split-shipping
  base-url="https://api.example.com"
  locale="en-US"
  cart-id="cart-123"
  cart-item-id="line-item-456"
  account-id="customer-789"
>
  <span>Custom Button Text</span>
  <img src="shipping-icon.svg" alt="Shipping Icon">
</split-shipping>

<!-- With custom address fields -->
<split-shipping
  base-url="https://api.example.com"
  locale="en-US"
  cart-id="cart-123"
  cart-item-id="line-item-456"
  .addressFields="${{
    firstName: { label: 'First Name' },
    lastName: { label: 'Last Name' },
    companyName: { label: 'Company' },
    streetNumber: { label: 'Street Number' },
    streetName: { label: 'Street Name' },
    city: { label: 'City' },
    state: { label: 'State' },
    zipCode: { label: 'Zip Code' },
    country: { label: 'Country' }
  }}"
>
  Split Shipping
</split-shipping>
```

## Attributes

| Attribute     | Type   | Description                                      | Required |
|---------------|--------|--------------------------------------------------|----------|
| base-url      | String | Base URL for API requests                        | Yes      |
| locale        | String | Locale for internationalization (default: en-US) | No       |
| cart-id       | String | ID of the cart to modify                         | Yes      |
| cart-item-id  | String | ID of the cart item to modify                    | Yes      |
| account-id    | String | ID of the customer account to fetch addresses    | No       |

## Properties

| Property      | Type   | Description                                      | Default |
|---------------|--------|--------------------------------------------------|---------|
| addressFields | Object | Configuration for address fields to display and collect | `{ firstName: { label: "First Name" }, lastName: { label: "Last Name" }, streetNumber: { label: "Street Number" }, streetName: { label: "Street Name" }, city: { label: "City" }, state: { label: "State" }, zipCode: { label: "Zip Code" }, country: { label: "Country" } }` |

### Custom Address Fields

The `addressFields` property allows customization of which address fields are displayed and collected in the address table and CSV template. Each field is defined with a label that will be used in the UI:

```javascript
{
  firstName: { label: "First Name" },
  lastName: { label: "Last Name" },
  // Add or remove fields as needed
  companyName: { label: "Company" },
  streetNumber: { label: "Street Number" },
  streetName: { label: "Street Name" },
  city: { label: "City" },
  state: { label: "State" },
  zipCode: { label: "Zip Code" },
  country: { label: "Country" }
}
```

The component will automatically adjust the table columns, form fields, and CSV validation based on the fields provided.

## Events

The component emits the following events:

| Event Name              | Detail                                      | Description                           |
|-------------------------|---------------------------------------------|---------------------------------------|
| address-selected        | `{ cartItemId, address }`                   | When an address is selected           |
| address-added           | `{ addressId }`                             | When a new address is added           |
| shipping-method-selected| `{ cartItemId, shippingMethodId }`          | When a shipping method is selected    |

## Styling

All components in the split-shipping module can be customized using CSS variables. Each component has its own set of variables with sensible defaults.

### Main Split Shipping Component

```css
split-shipping {
  /* Split Shipping Button Variables */
  --split-shipping-button-background-color: #3f51b5;
  --split-shipping-button-color: white;
  --split-shipping-button-border: none;
  --split-shipping-button-padding: 8px 16px;
  --split-shipping-button-border-radius: 4px;
  --split-shipping-button-cursor: pointer;
  --split-shipping-button-font-family: sans-serif;
  --split-shipping-button-font-size: 14px;
  --split-shipping-button-display: flex;
  --split-shipping-button-align-items: center;
  --split-shipping-button-justify-content: center;
  --split-shipping-button-hover-background-color: #303f9f;
}
```

### Modal Component

```css
split-shipping-modal {
  /* Modal Backdrop Variables */
  --modal-backdrop-position: fixed;
  --modal-backdrop-top: 0;
  --modal-backdrop-left: 0;
  --modal-backdrop-width: 100%;
  --modal-backdrop-height: 100%;
  --modal-backdrop-background-color: rgba(0, 0, 0, 0.5);
  --modal-backdrop-display: flex;
  --modal-backdrop-align-items: center;
  --modal-backdrop-justify-content: center;
  --modal-backdrop-z-index: 1000;
  
  /* Modal Content Variables */
  --modal-content-background-color: white;
  --modal-content-border-radius: 4px;
  --modal-content-width: 90%;
  --modal-content-max-width: 800px;
  --modal-content-max-height: 90vh;
  --modal-content-overflow-y: auto;
  --modal-content-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  --modal-content-display: flex;
  --modal-content-flex-direction: column;
  
  /* Modal Header Variables */
  --modal-header-display: flex;
  --modal-header-justify-content: space-between;
  --modal-header-align-items: center;
  --modal-header-padding: 16px;
  --modal-header-border-bottom: 1px solid #eee;
  
  /* Modal Title Variables */
  --modal-title-margin: 0;
  --modal-title-font-size: 18px;
  --modal-title-font-weight: bold;
  
  /* Modal Close Button Variables */
  --modal-close-background: none;
  --modal-close-border: none;
  --modal-close-font-size: 24px;
  --modal-close-cursor: pointer;
  --modal-close-color: #666;
  
  /* Modal Body Variables */
  --modal-body-padding: 16px;
  --modal-body-flex: 1;
  
  /* Section Variables */
  --section-margin-bottom: 24px;
  --section-border: 1px solid #eee;
  --section-border-radius: 4px;
  
  /* Section Header Variables */
  --section-header-padding: 12px 16px;
  --section-header-background-color: #f5f5f5;
  --section-header-display: flex;
  --section-header-justify-content: space-between;
  --section-header-align-items: center;
  --section-header-cursor: pointer;
  --section-header-border-bottom: 1px solid #eee;
  
  /* Section Title Variables */
  --section-title-margin: 0;
  --section-title-font-size: 16px;
  --section-title-font-weight: bold;
  
  /* Section Toggle Variables */
  --section-toggle-font-size: 18px;
  
  /* Section Content Variables */
  --section-content-padding: 16px;
}
```

### Address Section Component

```css
split-shipping-address-section {
  /* Address Section Variables */
  --address-section-font-family: sans-serif;
  --address-section-padding: 20px;
  
  /* Dropzone Variables */
  --dropzone-border: 2px dashed #ccc;
  --dropzone-border-radius: 8px;
  --dropzone-padding: 40px 20px;
  --dropzone-text-align: center;
  --dropzone-margin-bottom: 20px;
  --dropzone-transition: all 0.3s ease;
  --dropzone-background-color: #f9f9f9;
  --dropzone-cursor: pointer;
  
  /* Dropzone Dragging State Variables */
  --dropzone-dragging-border-color: #3f51b5;
  --dropzone-dragging-background-color: rgba(63, 81, 181, 0.1);
  
  /* Dropzone Icon Variables */
  --dropzone-icon-font-size: 48px;
  --dropzone-icon-color: #3f51b5;
  --dropzone-icon-margin-bottom: 10px;
  
  /* Dropzone Text Variables */
  --dropzone-text-margin-bottom: 15px;
  --dropzone-text-font-size: 16px;
  --dropzone-text-color: #555;
  
  /* File Input Variables */
  --file-input-display: none;
  
  /* Browse Button Variables */
  --browse-button-background-color: #3f51b5;
  --browse-button-color: white;
  --browse-button-border: none;
  --browse-button-padding: 8px 16px;
  --browse-button-border-radius: 4px;
  --browse-button-cursor: pointer;
  --browse-button-font-size: 14px;
  --browse-button-margin-top: 10px;
  
  /* Browse Button Hover Variables */
  --browse-button-hover-background-color: #303f9f;
  
  /* File Info Variables */
  --file-info-margin-top: 15px;
  --file-info-font-size: 14px;
  --file-info-color: #666;
  
  /* Error Message Variables */
  --error-message-color: #d32f2f;
  --error-message-margin: 15px 0;
  --error-message-padding: 10px;
  --error-message-background-color: rgba(211, 47, 47, 0.1);
  --error-message-border-radius: 4px;
  
  /* Submit Button Variables */
  --submit-button-background-color: #4caf50;
  --submit-button-color: white;
  --submit-button-border: none;
  --submit-button-padding: 10px 20px;
  --submit-button-border-radius: 4px;
  --submit-button-cursor: pointer;
  --submit-button-font-size: 16px;
  --submit-button-margin-top: 20px;
  
  /* Submit Button Hover Variables */
  --submit-button-hover-background-color: #388e3c;
  
  /* Submit Button Disabled Variables */
  --submit-button-disabled-background-color: #cccccc;
  --submit-button-disabled-cursor: not-allowed;
}
```

### Shipping Section Component

```css
split-shipping-shipping-section {
  /* Shipping Section Variables */
  --shipping-section-font-family: sans-serif;
  --shipping-section-padding: 20px;
  
  /* Section Title Variables */
  --section-title-font-size: 18px;
  --section-title-font-weight: bold;
  --section-title-margin-bottom: 16px;
  --section-title-color: #333;
  
  /* Address List Variables */
  --address-list-margin-bottom: 24px;
  
  /* Address Section Title Variables */
  --address-section-title-font-size: 16px;
  --address-section-title-font-weight: bold;
  --address-section-title-margin: 16px 0 8px;
  --address-section-title-color: #555;
  
  /* Loading Variables */
  --loading-display: flex;
  --loading-justify-content: center;
  --loading-align-items: center;
  --loading-padding: 24px;
  --loading-color: #666;
  
  /* Error Message Variables */
  --error-message-color: #d32f2f;
  --error-message-margin: 16px 0;
  --error-message-padding: 8px;
  --error-message-background-color: rgba(211, 47, 47, 0.1);
  --error-message-border-radius: 4px;
  
  /* Button Variables */
  --button-background-color: #3f51b5;
  --button-color: white;
  --button-border: none;
  --button-padding: 8px 16px;
  --button-border-radius: 4px;
  --button-cursor: pointer;
  --button-font-size: 14px;
  
  /* Button Hover Variables */
  --button-hover-background-color: #303f9f;
  
  /* Button Disabled Variables */
  --button-disabled-background-color: #cccccc;
  --button-disabled-cursor: not-allowed;
  
  /* Button Container Variables */
  --button-container-margin-top: 24px;
  --button-container-display: flex;
  --button-container-justify-content: flex-end;
}
```

### Shipping Address Item Component

```css
shipping-address-item {
  /* Address Item Variables */
  --address-item-border: 1px solid #eee;
  --address-item-border-radius: 4px;
  --address-item-padding: 16px;
  --address-item-margin-bottom: 12px;
  --address-item-display: flex;
  --address-item-align-items: center;
  
  /* Address Details Variables */
  --address-details-flex: 1;
  
  /* Address Line Variables */
  --address-line-margin-bottom: 4px;
  
  /* Quantity Control Variables */
  --quantity-control-display: flex;
  --quantity-control-align-items: center;
  --quantity-control-margin-left: 16px;
  
  /* Quantity Input Variables */
  --quantity-input-width: 60px;
  --quantity-input-padding: 8px;
  --quantity-input-border: 1px solid #ddd;
  --quantity-input-border-radius: 4px;
  --quantity-input-text-align: center;
  --quantity-input-margin: 0 8px;
  
  /* Comment Input Variables */
  --comment-input-width: 100%;
  --comment-input-padding: 8px;
  --comment-input-border: 1px solid #ddd;
  --comment-input-border-radius: 4px;
  --comment-input-margin-top: 8px;
  
  /* Error Message Variables */
  --error-message-color: #d32f2f;
  --error-message-font-size: 12px;
  --error-message-margin-top: 4px;
}
```

### Example: Customizing All Components

You can customize all components at once by setting variables at the root level:

```css
:root {
  /* Primary colors */
  --primary-color: #4a90e2;
  --primary-hover-color: #3a80d2;
  --error-color: #e74c3c;
  
  /* Apply to all components */
  --split-shipping-button-background-color: var(--primary-color);
  --split-shipping-button-hover-background-color: var(--primary-hover-color);
  --browse-button-background-color: var(--primary-color);
  --browse-button-hover-background-color: var(--primary-hover-color);
  --button-background-color: var(--primary-color);
  --button-hover-background-color: var(--primary-hover-color);
  --error-message-color: var(--error-color);
}
```

## Component Structure

- `split-shipping-component.ts`: Main component that renders the button and manages the modal
- `modal.ts`: Modal component that contains the address and shipping sections
- `address-section.ts`: Component for managing shipping addresses
- `shipping-section.ts`: Component for selecting shipping methods
- `shipping-address-item.ts`: Component for individual shipping address items

## Development

To extend or modify this component:

1. Clone the repository
2. Install dependencies: `npm install`
3. Make changes to the component files
4. Build the project: `npm run build`
5. Test the component in your application 