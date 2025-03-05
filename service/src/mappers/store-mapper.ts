import { Channel, Store } from '../types/store';
import { Store as CommercetoolsStore } from '@commercetools/platform-sdk';

export class StoreMapper {
  static mapCommercetoolsStoreToStore(store: CommercetoolsStore, locale: string): Store {
    return {
      name: store.name?.[locale],
      storeId: store.id,
      key: store.key,
      distributionChannels: store.distributionChannels.map((commercetoolsChannel) => {
        const channel: Channel = {
          id: commercetoolsChannel.id,
        };
        return channel;
      }),
      supplyChannels: store.supplyChannels.map((commercetoolsChannel) => {
        const channel: Channel = {
          id: commercetoolsChannel.id,
        };
        return channel;
      }),
    };
  }
}