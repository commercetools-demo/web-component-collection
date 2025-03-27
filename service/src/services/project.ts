import { createApiRoot } from "../client/create.client";

export const getProjectSettings = async () => {
    const apiRoot = createApiRoot();
    const projectSettings = await apiRoot.get().execute();
    return projectSettings.body;
};