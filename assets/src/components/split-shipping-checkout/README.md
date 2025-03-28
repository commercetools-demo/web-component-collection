# Split Shipping Checkout Component

A web component for handling shipping and delivery steps of a checkout process. This component supports both single and multiple shipping addresses, written with Lit Element.

## Features

- Regular shipping flow with address form and delivery method selection
- Split shipping flow for sending items to multiple addresses
- Support for logged-in users with saved addresses
- Separate billing address support
- Gift message support for multiple shipping addresses
- Responsive design with configurable styling
- Integration with commercetools API
- Handling of remaining quantities for split shipping
- Address validation support

## Installation

```bash
# If using npm
npm install @your-org/split-shipping-checkout

# If using yarn
yarn add @your-org/split-shipping-checkout
```

## Usage

### Basic Usage

```html
<script type="module">
  import '@your-org/split-shipping-checkout';
</script>

<split-shipping-checkout
  baseUrl="https://your-api-endpoint.com"
  cartId="your-cart-id"
  locale="en-US">
</split-shipping-checkout>
```

### With User ID for Logged-in Users

```html
<split-shipping-checkout
  baseUrl="https://your-api-endpoint.com"
  cartId="your-cart-id"
  userId="your-user-id"
  locale="en-US">
</split-shipping-checkout>
```

### JavaScript Interaction Example

```javascript
// Get reference to the component
const checkoutComponent = document.querySelector('split-shipping-checkout');

// Listen for events
checkoutComponent.addEventListener('form-submitted', (e) => {
  console.log('Form submitted:', e.detail);
});

// Programmatically update properties
checkoutComponent.cartId = 'new-cart-id';
```

## Properties

| Property                   | Attribute                    | Type              | Description                                     | Required |
|----------------------------|------------------------------|-------------------|-------------------------------------------------|----------|
| baseUrl                    | base-url                     | string            | Base URL for API calls                          | Yes      |
| cartId                     | cart-id                      | string            | ID of the current cart                          | Yes      |
| userId                     | user-id                      | string            | ID of the user if logged in                     | No       |
| locale                     | locale                       | string            | Current locale for localized strings            | Yes      |
| loading                    | -                            | boolean           | Internal state indicating loading status        | No       |
| showSplitShipping          | -                            | boolean           | Whether to show split shipping option           | No       |
| billingAddressSameAsShipping | -                          | boolean           | Whether billing address is same as shipping     | No       |

## Events

| Event                       | Description                                                       |
|-----------------------------|-------------------------------------------------------------------|
| form-submitted              | Fired when the shipping or delivery form is submitted             |
| toggle-split-shipping       | Fired when the split shipping mode is toggled                     |
| multiple-addresses-changed  | Fired when any address is changed in split shipping mode          |
| remaining-quantities-changed| Fired when item quantities change in split shipping               |
| shipping-method-selected    | Fired when a shipping method is selected                          |

## CSS Custom Properties

The component's appearance can be customized using CSS custom properties:

```css
split-shipping-checkout {
  --checkout-primary-color: #3366ff;
  --checkout-border-color: #e0e0e0;
  --checkout-background-color: #ffffff;
  --checkout-text-color: #333333;
  --checkout-error-color: #ff3366;
  --checkout-success-color: #33cc66;
  --checkout-font-family: 'Arial', sans-serif;
  --checkout-border-radius: 4px;
  --checkout-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --checkout-spacing: 16px;
}
```

## Child Components

This component consists of several child components that can also be used individually:

1. `<address-form>` - Form for entering shipping/billing address
2. `<address-preview>` - Displays a formatted address with optional edit/radio buttons
3. `<delivery-method>` - Displays available shipping methods for selection
4. `<split-item>` - Item selection component for multiple shipping addresses
5. `<normal-shipping-checkout-panel>` - Panel for single shipping address flow
6. `<split-shipping-checkout-panel>` - Panel for multi-shipping address flow

## API Endpoints Used

The component expects the following API endpoints:

- Get cart by id: `baseUrl/carts/:id`
- Store addresses on cart: `baseUrl/carts/:id/add-item-shipping-addresses`
- Update addresses on cart: `baseUrl/carts/:id/update-item-shipping-addresses`
- Set lineItem shipping address: `baseUrl/carts/:id/line-items/:lineItemId/shipping-addresses`
- Add shipping methods to cart: `baseUrl/carts/:id/add-shipping-methods`
- Set shipping method to cart: `baseUrl/carts/:id/set-shipping-method`
- Get user's addresses: `baseUrl/account/:id/addresses`
- Set shipping address: `baseUrl/carts/:id/set-shipping-address`
- Set billing address: `baseUrl/carts/:id/set-billing-address`
- Get project settings: `baseUrl/get-project-settings`

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 (with additional polyfills)

## Demo

A demo page is available at `assets/src/demo-split-shipping.html` which showcases both single and multiple shipping address flows.

## Troubleshooting

### Common Issues

1. **Component doesn't load**: Ensure the baseUrl and cartId are correctly provided.
2. **Shipping methods not appearing**: Check that the cart exists and the API endpoint for shipping methods is accessible.
3. **Address validation fails**: Verify that the address format matches the expected format for your region.

### Debug Mode

Add the `debug` attribute to enable debug logging:

```html
<split-shipping-checkout
  baseUrl="https://your-api-endpoint.com"
  cartId="your-cart-id"
  locale="en-US"
  debug>
</split-shipping-checkout>
```

## Contributing

Please refer to the [CONTRIBUTING.md](../../CONTRIBUTING.md) file for information on how to contribute to this project.

## License

MIT 