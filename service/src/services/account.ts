import { createApiRoot } from "../client/create.client";

export const getAddresses = async (id: string) => {
    const apiRoot = createApiRoot();
    const customer = await apiRoot.customers().withId({ ID: id }).get().execute();
    return customer.body.addresses;
};