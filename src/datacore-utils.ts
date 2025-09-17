import { App } from "obsidian";
import { DatacoreAPI } from "@blacksmithgu/datacore/lib/types/api";

export const getDatacoreAPI = (app: App): DatacoreAPI | undefined => {
  if (app.plugins.plugins.datacore) {
    return app.plugins.plugins.datacore.api;
  }
  return undefined;
};
