interface Money {
  currencyCode: string;
  centAmount: number;
}

interface Channel {
  obj?: {
    name?: {
      [key: string]: string;
    };
    key?: string;
  };
}

interface Price {
  value: Money;
  channel?: Channel;
}

interface ProductVariant {
  prices?: Price[];
}

interface ProductProjection {
  masterVariant?: ProductVariant;
}

class ProductPrices extends HTMLElement {
  private baseUrl: string = '';
  private sku: string = '';
  private priceCurrency: string = '';
  private priceCountry: string = '';
  private locale: string = '';
  private shadow: ShadowRoot;
  private dataLoaded: boolean = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.dataLoaded) {
      this.fetchAndRenderPrices();
    }
  }

  static get observedAttributes() {
    return ['baseurl', 'sku', 'price-currency', 'price-country', 'locale'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'baseurl':
          this.baseUrl = newValue;
          this.dataLoaded = false;
          break;
        case 'sku':
          this.sku = newValue;
          this.dataLoaded = false;
          break;
        case 'price-currency':
          this.priceCurrency = newValue;
          this.dataLoaded = false;
          break;
        case 'price-country':
          this.priceCountry = newValue;
          this.dataLoaded = false;
          break;
        case 'locale':
          this.locale = newValue;
          break;
        }
      this.fetchAndRenderPrices();
    }
  }

  private async fetchAndRenderPrices() {
    if (!this.baseUrl || !this.sku) return;

    try {
      const url = new URL(`${this.baseUrl}/products/sku/${this.sku}`);
      if (this.priceCountry) url.searchParams.append('priceCountry', this.priceCountry);
      if (this.priceCurrency) url.searchParams.append('priceCurrency', this.priceCurrency);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch product data');

      const data = await response.json();
      this.dataLoaded = true;
      this.renderPrices(data);
    } catch (error) {
      console.error('Error fetching product prices:', error);
      this.renderError();
    }
  }

  private renderPrices(productProjection: ProductProjection) {
    let prices = productProjection.masterVariant?.prices || [];
      // Filter prices by currency if priceCurrency is defined
      if (this.priceCurrency) {
        prices = prices.filter(price => price.value.currencyCode === this.priceCurrency);
      }
    
    const styles = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .price-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .price-item {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .price-item:last-child {
          border-bottom: none;
        }
        .channel-name {
          font-weight: bold;
        }
        .error {
          color: red;
          padding: 8px;
        }
      </style>
    `;

    const pricesList = prices.map((price: Price) => {
      const channelName = price.channel?.obj?.name?.[this.locale] || price.channel?.obj?.key || 'Default';
      const formattedValue = new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: price.value.currencyCode
      }).format(price.value.centAmount / 100);

      return `
        <li class="price-item">
          <span class="channel-name">${channelName}</span> - ${formattedValue}
        </li>
      `;
    }).join('');

    this.shadow.innerHTML = `
      ${styles}
      <ul class="price-list">
        ${pricesList || '<li>No prices available</li>'}
      </ul>
    `;
  }

  private renderError() {
    this.shadow.innerHTML = `
      <style>
        .error {
          color: red;
          padding: 8px;
        }
      </style>
      <div class="error">Failed to load product prices</div>
    `;
  }
}

customElements.define('product-prices', ProductPrices);

export default ProductPrices; 