import { Router } from 'express';
import { getAddressesController } from '../controllers/account.controller';
import { addCartItemAddressesController, addShippingMethodsController, getCartByIdController, setBillingAddressController, setLineItemShippingAddressesController, setShippingAddressController, setShippingMethodController, updateCartItemAddressesController } from '../controllers/cart.controller';
import { getGoogleMapApiKey } from '../controllers/googleMap.controller';
import { getProductByIdController, getProductBySkuController, getProductTypeByIdController } from '../controllers/products.controller';
import { getProjectSettingsController } from '../controllers/project.controller';
import { getShippingMethodsController, getShippingMethodsControllerForCart } from '../controllers/shippingMethod.controller';
import { getStoreById, getStores } from '../controllers/stores.controller';
import { logger } from '../utils/logger.utils';
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

serviceRouter.get('/get-project-settings', getProjectSettingsController);

serviceRouter.get('/shipping-methods', getShippingMethodsController);

serviceRouter.get('/shipping-methods/:cartId', getShippingMethodsControllerForCart);

serviceRouter.get('/account/:id/addresses', getAddressesController);

serviceRouter.get('/products/:id', getProductByIdController);

serviceRouter.get('/products/sku/:sku', getProductBySkuController);

serviceRouter.get('/product-types/:id', getProductTypeByIdController);

serviceRouter.get('/carts/:id', getCartByIdController);

serviceRouter.post('/carts/:id/set-shipping-address', setShippingAddressController);

serviceRouter.post('/carts/:id/set-billing-address', setBillingAddressController);

serviceRouter.post('/carts/:id/add-item-shipping-addresses', addCartItemAddressesController);

serviceRouter.put('/carts/:id/update-item-shipping-addresses', updateCartItemAddressesController);

serviceRouter.post('/carts/:id/line-items/:lineItemId/shipping-addresses', setLineItemShippingAddressesController);

serviceRouter.post('/carts/:id/set-shipping-method', setShippingMethodController);

serviceRouter.post('/carts/:id/add-shipping-methods', addShippingMethodsController);

export default serviceRouter;
