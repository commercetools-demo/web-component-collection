import { createApiRoot } from "../client/create.client";

export const getCartById = async (id: string) => {
  const apiRoot = createApiRoot();
  const cart = await apiRoot.carts().withId({ ID: id }).get().execute();
  return cart.body;
};