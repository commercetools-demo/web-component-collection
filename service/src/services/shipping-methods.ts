import { createApiRoot } from "../client/create.client";

export const getShippingMethods = async () => {
    const apiRoot = createApiRoot();
    const shippingMethods = await apiRoot.shippingMethods().get().execute();
    return shippingMethods.body?.results || [];
};

export const getShippingMethodsByCartId = async (cartId: string) => {
    const apiRoot = createApiRoot();
    const shippingMethods = await apiRoot.shippingMethods().matchingCart().get({
        queryArgs: {
            cartId
        }
    }).execute();
    return shippingMethods.body;
};