import { Request, Response } from "express";
import { getCartById, updateCartItemAddresses, setLineItemShippingAddresses } from "../services/cart";
import { log } from "console";

export const getCartByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cart = await getCartById(id);
  res.status(200).json(cart);
};

export const updateCartItemAddressesController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { addresses } = req.body;
  const cart = await updateCartItemAddresses(id, addresses);
  res.status(200).json(cart);
};

export const setLineItemShippingAddressesController = async (req: Request, res: Response) => {
  const { id, lineItemId } = req.params;
  const { targets } = req.body;
  const cart = await setLineItemShippingAddresses(id, lineItemId, targets);
  res.status(200).json(cart);
};