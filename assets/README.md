# Frontend Web Components

A collection of reusable web components built with TypeScript.

## Components

### [StoresMap](./src/components/stores-map/README.md)
A store locator component with Google Maps integration that allows users to find and select stores from a list or map view.

### [ProductPrices](./src/components/product-prices/README.md)
A component that displays a list of available prices for a product SKU, showing channel-specific pricing from commercetools.

### [StepVariantSelector](./src/components/step-variant-selector/README.md)
A component that allows users to select a variant of a product by selecting values for a set of attributes.

### [SplitShipping](./src/components/split-shipping/README.md)
A component that allows users to split shipping between multiple addresses.


## Use in React
Add the following script to your HTML file or use the script tag in your React component:

```html
<script
      src="<path-to-deployed-asset-connector>/components.js"
      type="module"
></script>
```
Create a new component to wrap the component for example `StepVariantSelector.tsx`:

```jsx
import React, { useRef, useEffect } from 'react';

interface Props {
  baseurl?: string;
  sku?: string;
  selectors?: string;
  locale?: string;
  onChangeSku?: (sku: string) => void; // optional callback to handle events
}

const StepVariantSelector: React.FC<Props> = ({ onChangeSku, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);

  const eventListener = (event: any) => { // event listener for custom events
    onChangeSku?.(event.detail.sku);
  };

  useEffect(() => {
    if (ref.current) {
      const element = document.createElement('step-variant-selector');
      element.addEventListener('sku-selected', eventListener); // add event listener for custom events

      Object.entries(props).forEach(([key, value]) => {
        if (typeof value === 'string') {
          element.setAttribute(key, value);
        }
      });

      ref.current.innerHTML = '';
      ref.current.appendChild(element);
    }
  }, []);

  return (
    <div
      ref={ref}
      // override styles here
      style={
        {
          '--selector-button-selected-background': 'rgb(23 58 95)',
        } as React.CSSProperties
      }
    />
  );
};

export default StepVariantSelector;
```


