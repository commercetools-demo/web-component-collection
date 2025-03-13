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
```

## Attributes

| Attribute     | Type   | Description                                      | Required |
|---------------|--------|--------------------------------------------------|----------|
| base-url      | String | Base URL for API requests                        | Yes      |
| locale        | String | Locale for internationalization (default: en-US) | No       |
| cart-id       | String | ID of the cart to modify                         | Yes      |
| cart-item-id  | String | ID of the cart item to modify                    | Yes      |
| account-id    | String | ID of the customer account to fetch addresses    | No       |

## Events

The component emits the following events:

| Event Name              | Detail                                      | Description                           |
|-------------------------|---------------------------------------------|---------------------------------------|
| address-selected        | `{ cartItemId, address }`                   | When an address is selected           |
| address-added           | `{ addressId }`                             | When a new address is added           |
| shipping-method-selected| `{ cartItemId, shippingMethodId }`          | When a shipping method is selected    |

## Styling

The component uses Shadow DOM for encapsulation but can be customized using CSS variables:

```css
split-shipping {
  --split-shipping-primary-color: #3f51b5;
  --split-shipping-hover-color: #303f9f;
  --split-shipping-text-color: white;
  --split-shipping-border-radius: 4px;
}
```

## Component Structure

- `split-shipping-component.ts`: Main component that renders the button and manages the modal
- `modal.ts`: Modal component that contains the address and shipping sections
- `address-section.ts`: Component for managing shipping addresses
- `shipping-section.ts`: Component for selecting shipping methods

## Development

To extend or modify this component:

1. Clone the repository
2. Install dependencies: `npm install`
3. Make changes to the component files
4. Build the project: `npm run build`
5. Test the component in your application 