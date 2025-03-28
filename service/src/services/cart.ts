import { createApiRoot } from "../client/create.client";
import { logger } from "../utils/logger.utils";

export const getCartById = async (id: string) => {
    const apiRoot = createApiRoot();
    const cart = await apiRoot.carts().withId({ ID: id }).get().execute();
    return cart.body;
};

export const updateCartItemAddresses = async (id: string, addresses: any[]) => {
    const apiRoot = createApiRoot();

    const cart = await getCartById(id).then((cart) => {
        // Get existing address keys from the cart
        const existingAddressKeys = new Set(
            (cart.itemShippingAddresses || []).map(address => address.key)
        );

        // Filter out addresses that already exist in the cart
        const updatedAddresses = addresses.filter(address => {
            // If address has no key, include it
            if (!address.key) {
                return false;
            }

            // Skip addresses with keys that already exist in the cart
            return existingAddressKeys.has(address.key);
        });

        // If no new addresses to add, return the cart as is
        if (updatedAddresses.length === 0) {
            return { body: cart };
        }

        return apiRoot.carts().withId({ ID: id }).post({
            body: {
                version: cart.version,
                actions: updatedAddresses.map((address) => ({
                    action: "updateItemShippingAddress",
                    address: address
                }))
            }
        }).execute();
    });
    return cart.body;
};

export const addCartItemAddresses = async (id: string, addresses: any[]) => {
    const apiRoot = createApiRoot();

    const cart = await getCartById(id).then((cart) => {
        // Get existing address keys from the cart
        const existingAddressKeys = new Set(
            (cart.itemShippingAddresses || []).map(address => address.key)
        );

        // Filter out addresses that already exist in the cart
        const newAddresses = addresses.filter(address => {
            

            // Skip addresses with keys that already exist in the cart
            return !existingAddressKeys.has(address.key) || !address.key;
        });

        // If no new addresses to add, return the cart as is
        if (newAddresses.length === 0) {
            return { body: cart };
        }

        return apiRoot.carts().withId({ ID: id }).post({
            body: {
                version: cart.version,
                actions: newAddresses.map((address) => ({
                    action: "addItemShippingAddress",
                    address: address
                }))
            }
        }).execute();
    });
    return cart.body;
};

export const setLineItemShippingAddresses = async (id: string, lineItemId: string, targets: any[]) => {
    const apiRoot = createApiRoot();
    const cart = await getCartById(id).then((cart) => {
        return apiRoot.carts().withId({ ID: id }).post({
            body: {
                version: cart.version,
                actions: [
                    {
                        action: "setLineItemShippingDetails",
                        lineItemId: lineItemId,
                        ...(targets && {
                            shippingDetails:{
                                targets: targets
                            }
                        })
                    }]
            }
        }).execute();
    });
    return cart.body;
};

export const setShippingAddress = async (id: string, address: any) => {
    const apiRoot = createApiRoot();
    const cart = await getCartById(id).then((cart) => {
        const isAddressInCart = cart.itemShippingAddresses?.some((item) => item.key === address.key);
        if (isAddressInCart) {
            return { body: cart };
        }
        return apiRoot.carts().withId({ ID: id }).post({
            body: {
                version: cart.version,
                actions: [{
                    action: "addItemShippingAddress",
                    address: address
                }]
            }
        }).execute();
    });
    return cart.body;
};

export const setBillingAddress = async (id: string, address: any) => {
    const apiRoot = createApiRoot();
    const cart = await getCartById(id).then((cart) => {
        return apiRoot.carts().withId({ ID: id }).post({
            body: {
                version: cart.version,
                actions: [
                    {
                        action: "setBillingAddress",
                        address: address
                    }
                ]
            }
        }).execute();
    });
    return cart.body;
};

export const setShippingMethod = async (id: string, shippingAddress: any, shippingKey: string, shippingMethodId: string) => {
    const apiRoot = createApiRoot();
    const cart = await getCartById(id).then((cart) => {
        const isShippingMethodInCart = cart.shipping?.some((item) => item.shippingKey === shippingKey);
        if (isShippingMethodInCart) {
            return { body: cart };
        }
        return apiRoot.carts().withId({ ID: id }).post({
            body: {
                version: cart.version,
                actions: [
                    {
                        action: "addShippingMethod",
                        shippingMethod: {
                            id: shippingMethodId,
                            typeId: "shipping-method"
                        },
                        shippingAddress: shippingAddress,
                        shippingKey: shippingKey
                    }
                ]
            }   
        }).execute();
    });
    return cart.body;
};

export const addShippingMethods = async (id: string, methods: any[]) => {
    const apiRoot = createApiRoot();
    const cart = await getCartById(id).then((cart) => {
        const existingMethods = cart.shipping?.filter((method) => methods.some((m) => m.shippingKey === method.shippingKey));
        const newMethods = methods.filter((method) => !existingMethods.some((m) => m.shippingKey === method.shippingKey));
        return apiRoot.carts().withId({ ID: id }).post({
            body: {
                version: cart.version,
                actions: newMethods.map((method) => (
                    {
                        action: "addShippingMethod",
                        shippingMethod: {
                            id: method.shippingMethodId,
                            typeId: "shipping-method"
                        },
                        shippingAddress: method.shippingAddress,
                        shippingKey: method.shippingKey
                    }
                ))
            }   
        }).execute();
    });
    return cart.body;
};