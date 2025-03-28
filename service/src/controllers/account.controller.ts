import { Request, Response } from 'express';
import { getAddresses } from '../services/account';

export const getAddressesController = async (req: Request, res: Response) => {
    const { id } = req.params;
  try {
    const addresses = await getAddresses(id);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};