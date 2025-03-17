import { Router } from 'express';
import { logger } from '../utils/logger.utils';
import { getGoogleMapApiKey } from '../controllers/googleMap.controller';
import { getStores, getStoreById } from '../controllers/stores.controller';
import { getProductByIdController, getProductBySkuController, getProductTypeByIdController } from '../controllers/products.controller';
import { getCartByIdController, addCartItemAddressesController, setLineItemShippingAddressesController, updateCartItemAddressesController } from '../controllers/cart.controller';
const serviceRouter = Router();


serviceRouter.get('/getGoogleMapApiKey', async (req, res, next) => {
  logger.info('Service getGoogleMapApiKey message received');

  try {
    await getGoogleMapApiKey(req, res);
  } catch (error) {
    next(error);
  }
});


serviceRouter.get('/getStores', async (req, res, next) => {
  logger.info('Service getStores message received');

  try {
    await getStores(req, res);
  } catch (error) {
    next(error);
  }
});

serviceRouter.get('/getStoreById', async (req, res, next) => {
  logger.info('Service getStoreById message received');

  try {
    await getStoreById(req, res);
  } catch (error) {
    next(error);
  }
});

serviceRouter.get('/products/:id', getProductByIdController);

serviceRouter.get('/products/sku/:sku', getProductBySkuController);

serviceRouter.get('/product-types/:id', getProductTypeByIdController);

serviceRouter.get('/carts/:id', getCartByIdController);

serviceRouter.post('/carts/:id/add-item-shipping-addresses', addCartItemAddressesController);

serviceRouter.put('/carts/:id/update-item-shipping-addresses', updateCartItemAddressesController);

serviceRouter.post('/carts/:id/line-items/:lineItemId/shipping-addresses', setLineItemShippingAddressesController);
export default serviceRouter;
