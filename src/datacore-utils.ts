import { App } from "obsidian";
import { DatacoreApi } from "@blacksmithgu/datacore";

export const getDatacoreAPI = (app: App): DatacoreApi | undefined => {
  const datacorePlugin = (app as any).plugins.plugins.datacore;
  if (datacorePlugin) {
    return datacorePlugin.api;
  }
  return undefined;
};
