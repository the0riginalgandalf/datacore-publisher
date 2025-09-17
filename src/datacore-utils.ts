import { UnsafeApp } from "./types";
import { DatacoreApi } from "@blacksmithgu/datacore";

export function getDatacoreAPI(app?: UnsafeApp | undefined): DatacoreApi {
  const api = app?.plugins.plugins["datacore"]?.api as DatacoreApi;

  if (!api) {
    throw new Error("Datacore API not found");
  }

  return api;
}
