import { Request, Response } from "express";
import { getCartById } from "../services/cart";

export const getCartByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cart = await getCartById(id);
  res.status(200).json(cart);
};
