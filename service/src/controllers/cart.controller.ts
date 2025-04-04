import { Request, Response } from "express";
import { addCartItemAddresses, addShippingMethods, getCartById, setBillingAddress, setLineItemShippingAddresses, setShippingAddress, setShippingMethod, updateCartItemAddresses } from "../services/cart";

export const getCartByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const cart = await getCartById(id);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addCartItemAddressesController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { addresses } = req.body;
  try {
    const cart = await addCartItemAddresses(id, addresses);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateCartItemAddressesController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { addresses } = req.body;
  try {
    const cart = await updateCartItemAddresses(id, addresses);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const setLineItemShippingAddressesController = async (req: Request, res: Response) => {
  const { id, lineItemId } = req.params;
  const { targets } = req.body;
  try {
    const cart = await setLineItemShippingAddresses(id, lineItemId, targets);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const setShippingAddressController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { address } = req.body;
  try {
    const cart = await setShippingAddress(id, address);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const setBillingAddressController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { address } = req.body;
  try {
    const cart = await setBillingAddress(id, address);  
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const setShippingMethodController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { shippingAddress, shippingKey, shippingMethodId } = req.body;
  try {
    const cart = await setShippingMethod(id, shippingAddress, shippingKey, shippingMethodId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addShippingMethodsController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { methods } = req.body;
  try {
    const cart = await addShippingMethods(id, methods);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};