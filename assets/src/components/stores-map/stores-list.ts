import { Store } from '../../types/store';

export class StoresList extends HTMLElement {
  static get observedAttributes() {
    return ['selected-store-id'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private stores: Store[] = [];
  private selectedStoreId: string | null = null;

  setStores(stores: Store[]) {
    this.stores = stores;
    this.render();
  }

  setSelectedStoreId(id: string | null) {
    this.selectedStoreId = id;
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
          overflow-y: auto;
        }
        .store-list {
          list-style: none;
          padding: 0 var(--stores-map-modal-padding, 1rem) 0 0;
          margin: 0;
        }
        .store-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--stores-list-item-padding, 1rem);
          border-bottom: var(--stores-list-item-border, 1px solid #eee);
          background: var(--stores-list-item-bg, white);
        }
        .store-item.selected {
          background: var(--stores-list-item-selected-bg, #f0f0f0);
        }
        .select-button {
          padding: var(--stores-list-button-padding, 0.5rem 1rem);
          background: var(--stores-list-button-bg, #007bff);
          color: var(--stores-list-button-color, white);
          border: none;
          border-radius: var(--stores-list-button-radius, 4px);
          cursor: pointer;
          height: var(--stores-list-button-height, 2rem);
        }
        .select-button:disabled {
          background: var(--stores-list-button-disabled-bg, #cccccc);
          cursor: not-allowed;
          opacity: var(--stores-list-button-disabled-opacity, 0.7);
        }
      </style>
      <ul class="store-list">
        ${this.stores
          .map(
            (store) => `
          <li class="store-item ${
            store.storeId === this.selectedStoreId ? 'selected' : ''
          }">
            <h3>${store.name || 'Unnamed Store'}</h3>
            <button 
              class="select-button" 
              data-store-id="${store.key}"
              ${store.storeId === this.selectedStoreId ? 'disabled' : ''}
            >
              ${store.storeId === this.selectedStoreId ? 'Selected' : 'Select Store'}
            </button>
          </li>
        `
          )
          .join('')}
      </ul>
    `;

    this.shadowRoot.querySelectorAll('.select-button:not([disabled])').forEach((button) => {
      button.addEventListener('click', (e) => {
        const storeId = (e.target as HTMLButtonElement).dataset.storeId;
        const store = this.stores.find((s) => s.key === storeId);
        if (store) {
          this.dispatchEvent(
            new CustomEvent('storeSelected', {
              detail: store,
              bubbles: true,
              composed: true,
            })
          );
        }
      });
    });
  }
}

customElements.define('stores-list', StoresList); 