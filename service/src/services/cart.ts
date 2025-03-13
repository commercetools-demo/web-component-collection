import { createApiRoot } from "../client/create.client";

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
        const newAddresses = addresses.filter(address => {
            // If address has no key, include it
            if (!address.key) {
                return true;
            }
            
            // Skip addresses with keys that already exist in the cart
            return !existingAddressKeys.has(address.key);
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
