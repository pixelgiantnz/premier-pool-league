/* eslint-disable */
export const api = new Proxy({}, { get: () => new Proxy({}, { get: () => null }) });
export const internal = api;
