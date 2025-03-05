import { Request, Response } from "express";
import { getStoresFromCTP, getStoreByIdFromCTP } from "../services/stores";

export const getStores = async (req: Request, res: Response) => {
    const { lat, lng, locale } = req.query;
    const stores = await getStoresFromCTP(Number(lat), Number(lng), locale as string);
    res.json(stores);
};

export const getStoreById = async (req: Request, res: Response) => {
    const { storeId, locale } = req.query;
    const store = await getStoreByIdFromCTP(storeId as string, locale as string);
    res.json(store);
};
