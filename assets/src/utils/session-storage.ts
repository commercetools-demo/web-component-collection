import { Store } from '../types/store';

export class SessionStorageUtil {
  static getStorageKey(componentName: string): string {
    return `web-component_${componentName}`;
  }

  static getSelectedStoreId(componentName: string): string | null {
    const store = this.getSelectedStore(componentName);
    return store?.storeId || null;
  }

  static getSelectedStore(componentName: string): Store | null {
    const storeJson = sessionStorage.getItem(this.getStorageKey(componentName));
    return storeJson ? JSON.parse(storeJson) : null;
  }

  static setSelectedStore(componentName: string, store: Store): void {
    sessionStorage.setItem(this.getStorageKey(componentName), JSON.stringify(store));
  }
} 