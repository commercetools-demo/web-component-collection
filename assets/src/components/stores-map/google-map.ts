import { Store } from '../../types/store';

export class GoogleMap extends HTMLElement {
  private map: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private stores: Store[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async initialize(apiKey: string) {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }
        #map {
          height: 100%;
          width: 100%;
        }
      </style>
      <div id="map"></div>
    `;

    await this.loadGoogleMapsScript(apiKey);
    const mapElement = this.shadowRoot.getElementById('map');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      zoom: 12,
      center: { lat: 0, lng: 0 },
    });

    this.map.addListener('center_changed', () => {
      if (this.map) {
        const center = this.map.getCenter();
        if (center) {
          this.dispatchEvent(
            new CustomEvent('mapMoved', {
              detail: {
                lat: center.lat(),
                lng: center.lng(),
              },
              bubbles: true,
              composed: true,
            })
          );
        }
      }
    });
  }

  private async loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', () => resolve());
      script.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      document.head.appendChild(script);
    });
  }

  setStores(stores: Store[]) {
    this.stores = stores;
    this.updateMarkers();
  }

  private updateMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    // Add new markers
    this.stores.forEach(store => {
      if (store.geoLocation) {
        const marker = new google.maps.Marker({
          position: store.geoLocation,
          map: this.map!,
          title: store.name
        });

        marker.addListener('click', () => {
          this.dispatchEvent(
            new CustomEvent('markerSelected', {
              detail: store,
              bubbles: true,
              composed: true,
            })
          );
        });

        this.markers.push(marker);
      }
    });
  }

  setCenter(lat: number, lng: number) {
    if (this.map) {
      this.map.setCenter({ lat, lng });
    }
  }
}

customElements.define('google-map', GoogleMap); 