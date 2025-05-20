import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StoresApiService } from '../../services/stores-api';
import { SessionStorageUtil } from '../../utils/session-storage';
import { debounce } from '../../utils/debounce';
import { Store } from '../../types/store';
import './stores-list';
import './google-map';

interface MapMovedEvent extends CustomEvent {
  detail: { lat: number; lng: number };
}

interface StoreSelectedEvent extends CustomEvent {
  detail: Store;
}

@customElement('stores-map')
export default class StoresMap extends LitElement {
  @state() private api: StoresApiService;
  @state() private debouncedLoadStores: (lat: number, lng: number) => void;
  @state() private mapInitialized: boolean = false;
  @state() private modalActive: boolean = false;
  @state() private errorMessage: string | null = null;

  @property({ type: String, attribute: 'base-url' }) baseUrl: string = '';
  @property({ type: String, attribute: 'selected-store-id' }) selectedStoreId: string | null = null;
  @property({ type: String }) locale: string | null = null;

  static styles = css`
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
  `;

  constructor() {
    super();
    this.api = new StoresApiService(this.baseUrl);
    this.debouncedLoadStores = debounce(this.loadStores.bind(this), 300);
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('baseUrl') && this.baseUrl) {
      this.api = new StoresApiService(this.baseUrl);
      this.mapInitialized = false;
    }
    if (changedProps.has('selectedStoreId') && this.selectedStoreId) {
      const storesList = this.shadowRoot?.querySelector('stores-list') as any;
      if (storesList) {
        storesList.setSelectedStoreId(this.selectedStoreId);
      }
    }
  }

  render() {
    return html`
      <button class="trigger-button" @click=${this.openModal}>
        <slot name="trigger">Select Store</slot>
      </button>

      <div class="modal ${this.modalActive ? 'active' : ''}">
        <div class="modal-content">
          <button class="close-button" @click=${this.closeModal}>&times;</button>
          ${this.errorMessage ? 
            html`
              <div class="error-container">
                <div class="error-message">${this.errorMessage}</div>
              </div>
            ` : 
            html`
              <div class="stores-list">
                <stores-list></stores-list>
              </div>
              <div class="map-container">
                <google-map @mapMoved=${this.handleMapMoved} @markerSelected=${this.handleMarkerSelected}></google-map>
              </div>
            `
          }
        </div>
      </div>
    `;
  }

  private openModal = async () => {
    this.modalActive = true;
    if (!this.mapInitialized) {
      await this.initializeMap();
      this.mapInitialized = true;
    }
  }

  private closeModal = () => {
    this.modalActive = false;
    this.errorMessage = null;
  }

  private handleMapMoved = async (e: Event) => {
    const customEvent = e as MapMovedEvent;
    const { lat, lng } = customEvent.detail;
    await this.debouncedLoadStores(lat, lng);
  }

  private handleMarkerSelected = (e: Event) => {
    const customEvent = e as StoreSelectedEvent;
    const store = customEvent.detail;
    this.handleStoreSelected(store);
  }

  private handleStoreSelected = (store: Store) => {
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
  }

  private async initializeMap() {
    try {
      const googleMap = this.shadowRoot?.querySelector('google-map') as any;
      if (googleMap) {
        const apiKey = await this.api.getGoogleMapApiKey();
        await googleMap.initialize(apiKey);
        
        // Try to get initial store location
        const initialStore = await this.getInitialStore();
        
        if (initialStore?.geoLocation) {
          // If we have a store with location, center on it
          const { lat, lng } = initialStore.geoLocation;
          googleMap.setCenter(lat, lng);
          await this.loadStores(lat, lng);
        } else if (navigator.geolocation) {
          // Fall back to user's location
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude: lat, longitude: lng } = position.coords;
              googleMap.setCenter(lat, lng);
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
      const storedStore = SessionStorageUtil.getSelectedStore(this.tagName.toLowerCase());

      // If we have a store ID from props, fetch that store
      if (this.selectedStoreId) {
        const store = await this.api.getStoreById(this.selectedStoreId, this.locale || undefined);
        if (store) {
          SessionStorageUtil.setSelectedStore(this.tagName.toLowerCase(), store);
          return store;
        }
      }
      
      // If no store ID from props but we have one in session, fetch that store
      if (storedStore?.storeId) {
        const store = await this.api.getStoreById(storedStore.storeId, this.locale || undefined);
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
      const stores = await this.api.getStores(lat, lng, this.locale || undefined);

      const storesList = this.shadowRoot?.querySelector('stores-list') as any;
      const googleMap = this.shadowRoot?.querySelector('google-map') as any;

      if (storesList) {
        storesList.setStores(stores);
        const storedStore = SessionStorageUtil.getSelectedStore(this.tagName.toLowerCase());
        storesList.setSelectedStoreId(storedStore?.storeId || null);
      }

      if (googleMap) {
        googleMap.setStores(stores);
      }
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Failed to load stores');
    }
  }

  private showError(message: string) {
    this.errorMessage = message;
  }
} 