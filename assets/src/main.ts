// Add a check for browser environment at the top of the file
const isBrowser = typeof window !== 'undefined' && typeof HTMLElement !== 'undefined';

// Import individual components for export
import StoresMap from './components/stores-map';
import ProductPrices from './components/product-prices';
import StepVariantSelector from './components/step-variant-selector';
import SplitShipping from './components/split-shipping';
import SplitShippingCheckout from './components/split-shipping-checkout';
import { AddressForm } from './components/split-shipping-checkout/address-form';
import { AddressPreview } from './components/split-shipping-checkout/address-preview';
import { DeliveryMethod } from './components/split-shipping-checkout/delivery-method';
import { SplitItem } from './components/split-shipping-checkout/split-item';

// Export components
export {
  StoresMap,
  ProductPrices,
  StepVariantSelector,
  SplitShipping,
  SplitShippingCheckout,
  AddressForm,
  AddressPreview,
  DeliveryMethod,
  SplitItem
};

// Conditionally define custom elements only in browser environments
if (isBrowser) {
  // Only try to define custom elements in a browser environment
  try {
    // These definitions should match your actual components
    customElements.define('ct-store-map', StoresMap);
    customElements.define('ct-product-prices', ProductPrices);
    customElements.define('ct-step-variant-selector', StepVariantSelector);
    customElements.define('ct-split-shipping', SplitShipping);
    customElements.define('ct-split-shipping-checkout', SplitShippingCheckout);
    customElements.define('ct-address-form', AddressForm);
    customElements.define('ct-address-preview', AddressPreview);
    customElements.define('ct-delivery-method', DeliveryMethod);
    customElements.define('ct-split-item', SplitItem);
  } catch (error) {
    console.warn('Error registering custom elements:', error);
  }
}