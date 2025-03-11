import { StoresApiService } from '../../services/stores-api';
import { SessionStorageUtil } from '../../utils/session-storage';
import { debounce } from '../../utils/debounce';
import { Store } from '../../types/store';
import './stores-list';
import './google-map';

interface MapMovedEvent extends CustomEvent {
  detail: { lat: number; lng: number };
}

interface MarkerSelectedEvent extends CustomEvent {
  detail: Store;
}

interface StoreSelectedEvent extends CustomEvent {
  detail: Store;
}

export default class StoresMap extends HTMLElement {
  private api: StoresApiService;
  private debouncedLoadStores: (lat: number, lng: number) => void;
  private mapInitialized: boolean = false;

  static get observedAttributes() {
    return ['base-url', 'selected-store-id', 'locale'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.api = new StoresApiService(this.getAttribute('base-url') || '');
    this.debouncedLoadStores = debounce(this.loadStores.bind(this), 300);
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'base-url' && oldValue !== newValue) {
      this.api = new StoresApiService(newValue);
      this.mapInitialized = false;
    }
    if (name === 'selected-store-id' && oldValue !== newValue) {
      const storesList = this.shadowRoot?.querySelector('stores-list');
      if (storesList) {
        (storesList as any).setSelectedStoreId(newValue);
      }
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .trigger-button {
          padding: var(--stores-map-button-padding, 0.5rem 1rem);
          background: var(--stores-map-button-bg, #007bff);
          color: var(--stores-map-button-color, white);
          border: none;
          border-radius: var(--stores-map-button-radius, 4px);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        /* Default content shown if no slot content provided */
        .trigger-button slot:empty::before {
          content: 'Select Store';
        }
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--stores-map-modal-bg, rgba(0, 0, 0, 0.5));
        }
        .modal.active {
          display: block;
        }
        .modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--stores-map-modal-content-bg, white);
          padding: var(--stores-map-modal-padding, 1rem);
          border-radius: var(--stores-map-modal-radius, 4px);
          width: var(--stores-map-modal-width, 90vw);
          height: var(--stores-map-modal-height, 80vh);
          display: flex;
        }
        .close-button {
          position: absolute;
          right: 1rem;
          top: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 1000;
        }
        .stores-list {
          flex: 1;
          border-right: var(--stores-map-divider, 1px solid #eee);
        }
        .map-container {
          flex: 2;
        }
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          padding: var(--stores-map-error-padding, 2rem);
        }
        .error-message {
          color: var(--stores-map-error-color, red);
          text-align: center;
          font-size: var(--stores-map-error-font-size, 1rem);
          padding: var(--stores-map-error-padding, 1rem);
          background: var(--stores-map-error-bg, #fff3f3);
          border-radius: var(--stores-map-error-radius, 4px);
          border: var(--stores-map-error-border, 1px solid #ffcdd2);
        }
      </style>

      <button class="trigger-button">
        <slot name="trigger">Select Store</slot>
      </button>

      <div class="modal">
        <div class="modal-content">
          <button class="close-button">&times;</button>
          <div class="stores-list">
            <stores-list></stores-list>
          </div>
          <div class="map-container">
            <google-map></google-map>
          </div>
        </div>
      </div>
    `;
  }

  private async setupEventListeners() {
    if (!this.shadowRoot) return;

    const triggerButton = this.shadowRoot.querySelector('.trigger-button');
    const modal = this.shadowRoot.querySelector('.modal');
    const closeButton = this.shadowRoot.querySelector('.close-button');
    const storesList = this.shadowRoot.querySelector('stores-list');
    const googleMap = this.shadowRoot.querySelector('google-map');

    triggerButton?.addEventListener('click', async () => {
      modal?.classList.add('active');
      if (!this.mapInitialized) {
        await this.initializeMap();
        this.mapInitialized = true;
      }
    });

    closeButton?.addEventListener('click', () => {
      modal?.classList.remove('active');
    });

    googleMap?.addEventListener('mapMoved', (async (e: Event) => {
      const customEvent = e as MapMovedEvent;
      const { lat, lng } = customEvent.detail;
      await this.debouncedLoadStores(lat, lng);
    }) as EventListener);

    googleMap?.addEventListener('markerSelected', ((e: Event) => {
      const customEvent = e as MarkerSelectedEvent;
      const store = customEvent.detail;
      if (storesList instanceof HTMLElement) {
        (storesList as any).setSelectedStoreId(store.storeId);
      }
    }) as EventListener);

    storesList?.addEventListener('storeSelected', ((e: Event) => {
      const customEvent = e as StoreSelectedEvent;
      const store = customEvent.detail;
      if (store.storeId) {
        SessionStorageUtil.setSelectedStore(this.tagName.toLowerCase(), store);
        this.dispatchEvent(
          new CustomEvent('storeSelected', {
            detail: store,
            bubbles: true,
            composed: true,
          })
        );
      }
    }) as EventListener);
  }

  private async initializeMap() {
    try {
      const googleMap = this.shadowRoot?.querySelector('google-map');
      if (googleMap) {
        const apiKey = await this.api.getGoogleMapApiKey();
        await (googleMap as any).initialize(apiKey);
        
        // Try to get initial store location
        const initialStore = await this.getInitialStore();
        
        if (initialStore?.geoLocation) {
          // If we have a store with location, center on it
          const { lat, lng } = initialStore.geoLocation;
          (googleMap as any).setCenter(lat, lng);
          await this.loadStores(lat, lng);
        } else if (navigator.geolocation) {
          // Fall back to user's location
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude: lat, longitude: lng } = position.coords;
              (googleMap as any).setCenter(lat, lng);
              this.loadStores(lat, lng);
            },
            () => {
              // Default to a fallback location if geolocation fails
              this.loadStores(0, 0);
            }
          );
        } else {
          this.loadStores(0, 0);
        }
      }
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Failed to initialize map');
    }
  }

  private async getInitialStore(): Promise<Store | null> {
    try {
      const locale = this.getAttribute('locale');
      const selectedStoreId = this.getAttribute('selected-store-id');
      const storedStore = SessionStorageUtil.getSelectedStore(this.tagName.toLowerCase());

      // If we have a store ID from props, fetch that store
      if (selectedStoreId) {
        const store = await this.api.getStoreById(selectedStoreId, locale || undefined);
        if (store) {
          SessionStorageUtil.setSelectedStore(this.tagName.toLowerCase(), store);
          return store;
        }
      }
      
      // If no store ID from props but we have one in session, fetch that store
      if (storedStore?.storeId) {
        const store = await this.api.getStoreById(storedStore.storeId, locale || undefined);
        if (store) {
          SessionStorageUtil.setSelectedStore(this.tagName.toLowerCase(), store);
          return store;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get initial store:', error);
      return null;
    }
  }

  private async loadStores(lat: number, lng: number) {
    try {
      const locale = this.getAttribute('locale');
      const stores = await this.api.getStores(lat, lng, locale || undefined);

      const storesList = this.shadowRoot?.querySelector('stores-list');
      const googleMap = this.shadowRoot?.querySelector('google-map');

      if (storesList) {
        (storesList as any).setStores(stores);
        const storedStore = SessionStorageUtil.getSelectedStore(this.tagName.toLowerCase());
        (storesList as any).setSelectedStoreId(storedStore?.storeId || null);
      }

      if (googleMap) {
        (googleMap as any).setStores(stores);
      }
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Failed to load stores');
    }
  }

  private showError(message: string) {
    const modalContent = this.shadowRoot?.querySelector('.modal-content');
    if (modalContent) {
      modalContent.innerHTML = `
        <button class="close-button">&times;</button>
        <div class="error-container">
          <div class="error-message">${message}</div>
        </div>
      `;

      // Reattach the close button event listener
      const closeButton = modalContent.querySelector('.close-button');
      closeButton?.addEventListener('click', () => {
        const modal = this.shadowRoot?.querySelector('.modal');
        modal?.classList.remove('active');
      });
    }
  }
}

customElements.define('stores-map', StoresMap); 