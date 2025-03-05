import { Router } from 'express';
import { logger } from '../utils/logger.utils';
import { getGoogleMapApiKey } from '../controllers/googleMap.controller';
import { getStores, getStoreById } from '../controllers/stores.controller';

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

export default serviceRouter;
