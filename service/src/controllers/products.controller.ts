import { Request, Response } from 'express';
import { searchProducts, getProductTypeById } from '../services/products';
import { logger } from '../utils/logger.utils';
const EXPANDS = [
    'masterVariant.prices[*].channel',
          'variants.prices[*].channel',
];

export const getProductByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await searchProducts({
        query: {
            exact: {
                field: 'id',
                value: id
            }
        }
    });
    return res.json(product.results?.[0]?.productProjection);
  } catch (error) {
    console.error('Controller error fetching product by ID:', error);
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Product not found'
    });
  }
};

export const getProductBySkuController = async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const { priceCountry, priceCurrency }: { priceCountry?: string, priceCurrency?: string } = req.query;
    logger.info('Searching product by SKU:', req.query);
    
    if (!sku) {
      return res.status(400).json({ error: 'Product SKU is required' });
    }

    const product = await searchProducts({
        query: {
            exact: {
                field: 'variants.sku',
                value: sku
            },
        },
        productProjectionParameters:{
            expand: EXPANDS,
            ...(priceCountry && {priceCountry}),
            ...(priceCurrency && {priceCurrency}),
            
        }
    });
    return res.json(product.results?.[0]?.productProjection);
  } catch (error) {
    console.error('Controller error fetching product by SKU:', error);
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Product not found'
    });
  }
};

export const getProductTypeByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Product Type ID is required' });
    }

    logger.info(`Controller fetching product type with ID: ${id}`);
    const productType = await getProductTypeById(id);
    return res.json(productType);
  } catch (error) {
    logger.error('Controller error fetching product type by ID:', error);
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Product Type not found'
    });
  }
};
