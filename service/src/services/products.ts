import { ProductPagedSearchResponse, ProductProjection, ProductSearchRequest, ProductType } from "@commercetools/platform-sdk";
import { createApiRoot } from "../client/create.client";
import { logger } from "../utils/logger.utils";

const EXPANDS = [
  'masterVariant.prices[*].channel',
        'variants.prices[*].channel',
];

// Get product projection in store by store key and product id.  
// This filters out any price channels that aren't part of the store.
export const getProductInStore = async (storeKey: string, productId: string): Promise<ProductProjection> => {
  try {
    const apiRoot = createApiRoot();
    const response = await apiRoot
      .inStoreKeyWithStoreKeyValue({storeKey: storeKey})
      .productProjections()
      .withId({ ID: productId })
      .get({
        queryArgs: {
          expand: EXPANDS
        }
      })
      .execute();
    return response.body;
  } catch (error) {
    console.error('Error fetching product in store:', error);
    throw error;
  }
};

export const searchProducts = async (
  searchParams: ProductSearchRequest
): Promise<ProductPagedSearchResponse> => {
  try {

    logger.info('Searching products with params:', searchParams);
    const apiRoot = createApiRoot();
    
    const response = await apiRoot
      .products()
      .search()
      .post({
        body: searchParams
      })
      .execute();

    return response.body;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getProductTypeById = async (id: string): Promise<ProductType> => {
  try {
    logger.info(`Fetching product type with ID: ${id}`);
    const apiRoot = createApiRoot();
    
    const response = await apiRoot
      .productTypes()
      .withId({ ID: id })
      .get()
      .execute();

    return response.body;
  } catch (error) {
    logger.error('Error fetching product type by ID:', error);
    throw error;
  }
};


