import { Request, Response } from "express";
import { getShippingMethodsByCartId, getShippingMethods } from "../services/shipping-methods";

export const getShippingMethodsController = async (req: Request, res: Response) => {
    try {
        const shippingMethods = await getShippingMethods();
        res.status(200).json(shippingMethods);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};
export const getShippingMethodsControllerForCart = async (req: Request, res: Response) => {
    const { cartId } = req.params;
    try {
        const shippingMethods = await getShippingMethodsByCartId(cartId);
        res.status(200).json(shippingMethods);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};