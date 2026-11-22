export interface QNetworkAdapter<S = any, A extends string = string> {
  serializeState: (state: S) => string;
  deserializeState?: (key: string) => S;
  formatAction: (action: A) => string;
  mapActionToCommand: (action: A) => string;
}

export const qNetworkAdapter: QNetworkAdapter<Record<string, any>, string> = {
  serializeState: (s) => (typeof s === "string" ? s : Object.values(s).join("|")),
  deserializeState: (key) => ({ key }),
  formatAction: (a) => a.toUpperCase(),
  mapActionToCommand: (a) => a.toLowerCase(),
};
