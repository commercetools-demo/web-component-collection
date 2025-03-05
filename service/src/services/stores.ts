import { createApiRoot } from "../client/create.client";
import CustomError from "../errors/custom.error";
import { distance } from "../utils/distance";
import { logger } from "../utils/logger.utils";
import { StoreMapper } from "../mappers/store-mapper";
import { Store } from "../types/store";

export const getStoreByIdFromCTP = async (storeId: string, locale: string) => {
    const apiRoot = createApiRoot();
    const store = await apiRoot.stores().withId({ ID: storeId }).get().execute();
    const resultStore: Store = StoreMapper.mapCommercetoolsStoreToStore(store.body, locale);
    
    if (resultStore) {
      const distributionChannel = store.body.distributionChannels?.[0];
      const channel = await apiRoot.channels().withId({ ID: distributionChannel.id }).get().execute();
      if (channel) {
        resultStore.geoLocation = {
          lng: channel.body.geoLocation?.coordinates?.[0],
          lat: channel.body.geoLocation?.coordinates?.[1],
        };
      }
    }
    return resultStore;
};

export const getStoresFromCTP = async (lat: number, lng: number, locale: string) => {
    const apiRoot = createApiRoot();

    try {
      const where = `geoLocation within circle(${lng}, ${lat}, ${process.env.STORE_RADIUS})`;

      const channels = await apiRoot
        .channels()
        .get({
          queryArgs: {
            where,
          },
        })
        .execute()
        .then((response) => {
          return response.body.results;
        })
        .catch((error) => {
          throw new CustomError(error.code, error.message, error.body);
        });

      if (!channels.length) {
        return [];
      }

      const storesWhere = `distributionChannels(id in (${channels.map((channel) => `"${channel.id}"`).join(',')}))`;

      const stores = await apiRoot
        .stores()
        .get({
          queryArgs: {
            where: storesWhere,
          },
        })
        .execute()
        .then((response) => {
          return response.body.results.map((store) => StoreMapper.mapCommercetoolsStoreToStore(store, locale));
        })
        .catch((error) => {
          throw new CustomError(error.code, error.message, error.body);
        });
      const storesWithGeoLocation = stores.map((store) => {
        const channel = channels.find((channel) => channel.id === store.distributionChannels?.[0]?.id);
        if (channel) {
          store.geoLocation = {
            lng: channel.geoLocation?.coordinates?.[0],
            lat: channel.geoLocation?.coordinates?.[1],
          };
        }
        return store;
      });

      return storesWithGeoLocation.sort((a, b) => {
        const distanceA = distance(lat, lng, a.geoLocation?.lat || 0, a.geoLocation?.lng || 0);
        const distanceB = distance(lat, lng, b.geoLocation?.lat || 0, b.geoLocation?.lng || 0);
        return distanceA - distanceB;
      });
    } catch (error) {
      logger.error('error', error);

      return [];
    }
};