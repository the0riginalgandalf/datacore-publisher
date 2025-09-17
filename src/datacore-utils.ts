import { UnsafeApp } from "./types";
import { DatacoreApi, getAPI } from "@blacksmithgu/datacore";

export function getDatacoreAPI(app?: UnsafeApp | undefined): DatacoreApi {
  const api = getAPI(app);

  if (!api) {
    throw new Error("Datacore API not found");
  }

  return api;
}
