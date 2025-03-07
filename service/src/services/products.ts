import { ProductPagedSearchResponse, ProductSearchRequest } from "@commercetools/platform-sdk";
import { createApiRoot } from "../client/create.client";
import { logger } from "../utils/logger.utils";
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


