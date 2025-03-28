import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CheckoutService } from '../../services/checkout-service';
import { Address, Cart, FormSubmittedEvent, ShippingMethod, ShippingTarget } from '../../types/checkout';
import './address-form';
import './address-preview';
import './delivery-method';
import './normal-shipping-checkout-panel';
import './split-item';
import './split-shipping-checkout-panel';

@customElement('split-shipping-checkout')
export default class SplitShippingCheckout extends LitElement {
  // Required props
  @property({ type: String }) baseUrl = '';
  @property({ type: String }) cartId = '';
  @property({ type: String }) locale = 'en-US';

  // Optional props
  @property({ type: String }) userId = '';

  // Internal state
  @state() private cart: Cart | null = null;
  @state() private loading = true;
  @state() private error = '';
  @state() private userAddresses: Address[] = [];
  @state() private shippingAddress: Partial<Address> = {};
  @state() private billingAddress: Partial<Address> = {};
  @state() private billingAddressSameAsShipping = true;
  @state() private showSplitShipping = false;
  @state() private countries: string[] = [];
  @state() private shippingMethods: ShippingMethod[] = [];
  @state() private selectedShippingMethodId = '';
  @state() private multipleAddresses: {
    key: string;
    address: Partial<Address>;
    lineItems: {
      lineItemId: string;
      quantity: number;
    }[];
    showDelivery: boolean;
    shippingMethodId: string;
    giftMessage: string;
  }[] = [];
  @state() private remainingQuantities: Record<string, number> = {};
  @state() private splitAddressIndex = 0;

  // Service for API calls
  private checkoutService: CheckoutService;

  constructor() {
    super();
    this.checkoutService = new CheckoutService('');
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.baseUrl) {
      this.checkoutService = new CheckoutService(this.baseUrl);
      this.init();
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('baseUrl') && this.baseUrl) {
      this.checkoutService = new CheckoutService(this.baseUrl);
      this.init();
    }

    if (changedProperties.has('cartId') && this.cartId) {
      this.init();
    }
  }

  private async init() {
    if (!this.baseUrl || !this.cartId) return;

    try {
      this.loading = true;

      // Get project settings for countries
      const projectSettings = await this.checkoutService.getProjectSettings();
      this.countries = projectSettings.countries;

      // Get cart
      const cart = await this.checkoutService.getCartById(this.cartId);
      this.cart = cart;

      // Initialize remaining quantities
      this.initRemainingQuantities();

      // Get shipping methods
      this.shippingMethods = await this.checkoutService.getShippingMethods();

      // If user is logged in, fetch their addresses
      if (this.userId) {
        const addresses = await this.checkoutService.getUserAddresses(this.userId);
        this.userAddresses = addresses;
      }

      // Initialize from cart data
      this.initFromCartData(cart);

      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.error = error instanceof Error ? error.message : 'An error occurred';
      console.error(error);
    }
  }

  private initFromCartData(cart: Cart) {
    // Handle shipping address for single shipping flow
    if (cart.shippingAddress) {
      this.setShippingAddressFromCart(cart.shippingAddress);
    }

    // Handle billing address if present
    if (cart.billingAddress) {
      this.billingAddress = { ...cart.billingAddress };

      // Check if billing address is different from shipping address
      if (cart.shippingAddress) {
        const isSameAddress = this.areAddressesSame(cart.shippingAddress, cart.billingAddress);
        this.billingAddressSameAsShipping = isSameAddress;
      }
    }

    // Set shipping method if present in cart for single shipping mode
    if (cart.shippingInfo?.shippingMethod && cart.shippingInfo.shippingMethod.id) {
      this.selectedShippingMethodId = cart.shippingInfo.shippingMethod.id;
    }

    // Check conditions for multiple shipping
    if (this.shouldInitializeMultipleShipping(cart)) {
      this.initializeMultipleShipping(cart);
    }
  }

  private shouldInitializeMultipleShipping(cart: Cart): boolean {
    // Check if cart has multiple shipping addresses
    const hasMultipleShippingAddresses = cart.itemShippingAddresses && cart.itemShippingAddresses.length > 1;

    // Check if cart has multiple shipping entries
    const hasMultipleShipping = cart.shipping && cart.shipping.length > 1;

    // Check if line items have different target addresses
    let uniqueAddressKeys = new Set<string>();
    cart.lineItems.forEach(item => {
      if (item.shippingDetails?.targets) {
        item.shippingDetails.targets.forEach(target => {
          uniqueAddressKeys.add(target.addressKey);
        });
      }
    });
    const hasMultipleTargetAddresses = uniqueAddressKeys.size > 1;

    return !!hasMultipleShippingAddresses && hasMultipleShipping && hasMultipleTargetAddresses;
  }

  private areAddressesSame(address1: Address, address2: Address): boolean {
    return (
      address1.streetName === address2.streetName &&
      address1.streetNumber === address2.streetNumber &&
      address1.postalCode === address2.postalCode &&
      address1.city === address2.city &&
      address1.country === address2.country
    );
  }

  private initializeMultipleShipping(cart: Cart) {
    // Initialize multipleAddresses array from cart data
    this.multipleAddresses = [];
    const addressMap = new Map<string, {
      address: Address,
      lineItems: { lineItemId: string; quantity: number; }[],
      showDelivery: boolean,
      shippingMethodId: string,
      giftMessage: string
    }>();

    // Build address map from cart's itemShippingAddresses
    if (cart.itemShippingAddresses) {
      cart.itemShippingAddresses.forEach(itemAddress => {
        const shippingItem = cart.shipping?.find(shipping => shipping.shippingAddress?.key === itemAddress.key);
        addressMap.set(itemAddress.key, {
          address: itemAddress,
          lineItems: [],
          showDelivery: true, // Already has shipping method set
          shippingMethodId: shippingItem?.shippingInfo.shippingMethod.id || '',
          giftMessage: itemAddress?.additionalAddressInfo || ''
        });
      });
    }
    // Add line items to respective addresses
    cart.lineItems.forEach(lineItem => {
      if (lineItem.shippingDetails?.targets) {
        lineItem.shippingDetails.targets.forEach(target => {
          const addressData = addressMap.get(target.addressKey);
          if (addressData) {
            addressData.lineItems.push({
              lineItemId: lineItem.id,
              quantity: target.quantity
            });
          }
        });
      }
    });

    // Convert map to array for multipleAddresses
    addressMap.forEach((data, key) => {
      this.multipleAddresses.push({
        key,
        address: data.address || {} as Address,
        lineItems: data.lineItems,
        showDelivery: data.showDelivery,
        shippingMethodId: data.shippingMethodId,
        giftMessage: data.giftMessage
      });
    });

    // Update remaining quantities based on already allocated quantities
    if (this.multipleAddresses.length > 0) {
      this.showSplitShipping = true;
      this.updateRemainingQuantitiesFromMultipleAddresses();
      this.splitAddressIndex = this.multipleAddresses.length;
    }
  }

  private updateRemainingQuantitiesFromMultipleAddresses() {
    // Reset remaining quantities
    this.initRemainingQuantities();

    // Subtract quantities allocated to multiple addresses
    this.multipleAddresses.forEach(address => {
      address.lineItems.forEach(item => {
        if (this.remainingQuantities[item.lineItemId] !== undefined) {
          this.remainingQuantities[item.lineItemId] -= item.quantity;
        }
      });
    });
  }

  private initRemainingQuantities() {
    if (!this.cart) return;

    this.remainingQuantities = {};
    for (const lineItem of this.cart.lineItems) {
      this.remainingQuantities[lineItem.id] = lineItem.quantity;
    }
  }

  private setShippingAddressFromCart(address: Address) {
    this.shippingAddress = { ...address };
  }

  private hasMultipleItems(): boolean {
    if (!this.cart) return false;

    // Calculate total quantity across all line items
    const totalQuantity = this.cart.lineItems.reduce((total, item) => total + item.quantity, 0);

    // Return true if total quantity is greater than 1
    return totalQuantity > 1;
  }

  private canUseSplitShipping(): boolean {
    // Only check if cart has multiple items
    return this.hasMultipleItems();
  }

  // Event handlers
  private handleShippingAddressChange(e: CustomEvent) {
    const { address } = e.detail;
    this.shippingAddress = { ...address };
  }

  private handleBillingAddressChange(e: CustomEvent) {
    const { address } = e.detail;
    this.billingAddress = { ...address };
  }

  private handleBillingSameAsShippingChanged(e: CustomEvent) {
    const { billingAddressSameAsShipping } = e.detail;
    this.billingAddressSameAsShipping = billingAddressSameAsShipping;
  }

  private handleEditBillingAddress() {
    this.billingAddressSameAsShipping = false;
  }

  private handleNewAddressClick(e: CustomEvent) {
    const { shippingAddress } = e.detail;
    this.shippingAddress = shippingAddress;
  }

  private handleToggleSplitShipping() {
    // Reset state when toggling split shipping
    if (!this.showSplitShipping) {
      this.initRemainingQuantities();
      this.multipleAddresses = [{
        key: `address-${this.splitAddressIndex}`,
        address: {},
        lineItems: [],
        showDelivery: false,
        shippingMethodId: '',
        giftMessage: ''
      }];
      this.splitAddressIndex = 1;
    } else {
      this.multipleAddresses = [];
      this.splitAddressIndex = 0;
    }

    this.showSplitShipping = !this.showSplitShipping;
  }


  private handleMultipleAddressesChanged(e: CustomEvent) {
    const { multipleAddresses } = e.detail;
    this.multipleAddresses = multipleAddresses;
  }

  private handleSplitAddressIndexChanged(e: CustomEvent) {
    const { splitAddressIndex } = e.detail;
    this.splitAddressIndex = splitAddressIndex;
  }

  private handleRemainingQuantitiesChanged(e: CustomEvent) {
    const { lineItemId, quantityChange } = e.detail;
    if (this.remainingQuantities[lineItemId] !== undefined) {
      this.remainingQuantities[lineItemId] += quantityChange;
      this.remainingQuantities = { ...this.remainingQuantities };
    }
  }

  private handleShippingMethodSelection(e: CustomEvent) {
    this.selectedShippingMethodId = e.detail.shippingMethodId;
  }

  private handleSavedAddressSelected(e: CustomEvent) {
    const { shippingAddress } = e.detail;
    this.shippingAddress = shippingAddress;
  }

  private handleEditShippingAddress(e: CustomEvent) {
    const { shippingAddress } = e.detail;
    this.shippingAddress = shippingAddress;
  }

  private async handleSubmitShipping() {
    if (!this.cart) return;

    try {
      this.loading = true;

      if (this.showSplitShipping) {
        await this.submitSplitShipping();
      } else {
        await this.submitNormalShipping();
      }
      // Dispatch form submitted event
      this.dispatchEvent(new CustomEvent('form-submitted', {
        bubbles: true,
        composed: true
      }) as FormSubmittedEvent);

      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.error = error instanceof Error ? error.message : 'An error occurred';
      console.error(error);
    }
  }

  private async submitNormalShipping() {
    if (!this.cart) return;

    // Set shipping address
    const updatedCart = await this.checkoutService.setShippingAddress(this.cartId, this.shippingAddress as Address);

    // Set billing address if different
    if (!this.billingAddressSameAsShipping) {
      await this.checkoutService.setBillingAddress(this.cartId, this.billingAddress as Address);
    }

    // Set shipping method
    if (this.selectedShippingMethodId) {
      await this.checkoutService.setShippingMethod(this.cartId, this.shippingAddress as Address, this.shippingAddress.key || '', this.selectedShippingMethodId);
    }

    for (const lineItem of this.cart.lineItems) {
      const targets: ShippingTarget[] = [{
        addressKey: this.shippingAddress.key || '',
        quantity: lineItem.quantity,
        shippingMethodKey: this.shippingAddress.key || '',
      }];

      if (targets.length > 0) {
        await this.checkoutService.setLineItemShippingAddress(this.cartId, lineItem.id, targets);
      }
    }

    // Update cart
    this.cart = updatedCart;
  }

  private async submitSplitShipping() {
    if (!this.cart) return;

    // Add item shipping addresses
    const itemShippingAddresses = this.multipleAddresses.map(addr => ({
      ...addr.address,
      key: addr.key,
      additionalAddressInfo: addr.giftMessage
    } as Address
    ));


    await this.checkoutService.addItemShippingAddresses(this.cartId, itemShippingAddresses);

    // Add shipping methods
    const shippingMethods = this.multipleAddresses
      .filter(addr => addr.shippingMethodId)
      .map(addr => ({
        shippingAddress: addr.address as Address,
        shippingMethodId: addr.shippingMethodId,
        shippingKey: addr.key
      }));

    if (shippingMethods.length > 0) {
      await this.checkoutService.addShippingMethods(this.cartId, shippingMethods);
    }

    // Set line item shipping addresses
    for (const lineItem of this.cart.lineItems) {
      const targets: ShippingTarget[] = [];

      for (const addr of this.multipleAddresses) {
        const lineItemInAddress = addr.lineItems.find(item => item.lineItemId === lineItem.id);

        if (lineItemInAddress && lineItemInAddress.quantity > 0) {
          targets.push({
            addressKey: addr.key,
            quantity: lineItemInAddress.quantity,
            shippingMethodKey: addr.key,
          });
        }
      }

      if (targets.length > 0) {
        console.log('targets', targets);
        await this.checkoutService.setLineItemShippingAddress(this.cartId, lineItem.id, targets);
      }
    }
  }

  static styles = css`
    display: block;

    .split-shipping-checkout {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
    }

    .error-message {
      color: var(--checkout-error-color, #ff3366);
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid var(--checkout-error-color, #ff3366);
      border-radius: 4px;
      background-color: rgba(255, 51, 102, 0.1);
    }

    .loading {
      opacity: 0.5;
      pointer-events: none;
    }
  `;

  render() {
    if (this.loading) {
      return html`<div class="split-shipping-checkout loading">Loading checkout...</div>`;
    }

    if (this.error) {
      return html`
        <div class="split-shipping-checkout">
          <div class="error-message">${this.error}</div>
        </div>
      `;
    }

    if (!this.cart) {
      return html`
        <div class="split-shipping-checkout">
          <div class="error-message">Cart not found.</div>
        </div>
      `;
    }

    if (this.cart.shippingMode !== 'Multiple') {
      return html`
        <slot name="fallback"></slot>
      `;
    }

    return html`
      <div class="split-shipping-checkout">
        ${this.showSplitShipping ?
        html`
            <split-shipping-checkout-panel
              .cart="${this.cart}"
              .countries="${this.countries}"
              .shippingMethods="${this.shippingMethods}"
              .locale="${this.locale}"
              .remainingQuantities="${this.remainingQuantities}"
              .multipleAddresses="${this.multipleAddresses}"
              .splitAddressIndex="${this.splitAddressIndex}"
              @multiple-addresses-changed="${this.handleMultipleAddressesChanged}"
              @split-address-index-changed="${this.handleSplitAddressIndexChanged}"
              @remaining-quantities-changed="${this.handleRemainingQuantitiesChanged}"
              @toggle-split-shipping="${this.handleToggleSplitShipping}"
              @submit-shipping="${this.handleSubmitShipping}"
            ></split-shipping-checkout-panel>
          ` :
        html`
            <normal-shipping-checkout-panel
              .cart="${this.cart}"
              .userAddresses="${this.userAddresses}"
              .countries="${this.countries}"
              .shippingMethods="${this.shippingMethods}"
              .locale="${this.locale}"
              .canUseSplitShipping="${this.canUseSplitShipping()}"
              .cartId="${this.cartId}"
              .baseUrl="${this.baseUrl}"
              @shipping-address-changed="${this.handleShippingAddressChange}"
              @billing-address-changed="${this.handleBillingAddressChange}"
              @billing-same-as-shipping-changed="${this.handleBillingSameAsShippingChanged}"
              @edit-billing-address="${this.handleEditBillingAddress}"
              @new-address-click="${this.handleNewAddressClick}"
              @toggle-split-shipping="${this.handleToggleSplitShipping}"
              @shipping-method-selected="${this.handleShippingMethodSelection}"
              @submit-shipping="${this.handleSubmitShipping}"
              @saved-address-selected="${this.handleSavedAddressSelected}"
              @edit-shipping-address="${this.handleEditShippingAddress}"
            ></normal-shipping-checkout-panel>
          `
      }
      </div>
    `;
  }
}
