# Commercetools Web Components

This package provides reusable web components for Commercetools projects.

## Installation

```bash
npm install @commercetools-demo/web-components-assets
# or
yarn add @commercetools-demo/web-components-assets
```

## Usage

### Import Components

You can import the components directly:

```javascript
import { StoresMap, ProductPrices } from '@commercetools-demo/web-components-assets';

// The components are automatically registered as custom elements
// <ct-store-map></ct-store-map>
// <ct-product-prices></ct-product-prices>
```

### Individual Component Imports

You can also import individual components to reduce bundle size:

```javascript
import StoresMap from '@commercetools-demo/web-components-assets/stores-map';
import ProductPrices from '@commercetools-demo/web-components-assets/product-prices';
```

## Next.js Integration

In Next.js applications, web components rely on browser APIs that aren't available during server-side rendering. 

### Using Client Components

With Next.js App Router, use client components:

```javascript
'use client'

import { StoresMap, ProductPrices } from '@commercetools-demo/web-components-assets';

export default function ProductPage() {
  return (
    <div>
      <h1>Product Details</h1>
      <ct-product-prices sku="ABC123"></ct-product-prices>
      <ct-store-map apikey="YOUR_API_KEY"></ct-store-map>
    </div>
  );
}
```

### Pages Router

With Pages Router, use the component in a useEffect hook:

```javascript
import { useEffect, useRef } from 'react';
import { ProductPrices } from '@commercetools-demo/web-components-assets';

export default function ProductPage() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Components are initialized on the client-side only
    const productPrices = document.createElement('ct-product-prices');
    productPrices.setAttribute('sku', 'ABC123');
    containerRef.current.appendChild(productPrices);
    
    return () => {
      containerRef.current.innerHTML = '';
    };
  }, []);
  
  return (
    <div>
      <h1>Product Details</h1>
      <div ref={containerRef}></div>
    </div>
  );
}
```

## Available Components

- `StoresMap`: Google Maps based store locator
- `ProductPrices`: Display product prices
- `StepVariantSelector`: Multi-step variant selection UI
- `SplitShipping`: Split shipping functionality
- `SplitShippingCheckout`: Checkout UI for split shipping
- `AddressForm`: Reusable address form
- `AddressPreview`: Address preview component
- `DeliveryMethod`: Delivery method selection
- `SplitItem`: Individual item in split shipping

## License

[MIT](https://opensource.org/licenses/MIT)


