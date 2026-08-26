/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as leagues from "../leagues.js";
import type * as lib_leagues from "../lib/leagues.js";
import type * as lib_limits from "../lib/limits.js";
import type * as lib_password from "../lib/password.js";
import type * as lib_players from "../lib/players.js";
import type * as lib_sessions from "../lib/sessions.js";
import type * as lib_validators from "../lib/validators.js";
import type * as players from "../players.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  leagues: typeof leagues;
  "lib/leagues": typeof lib_leagues;
  "lib/limits": typeof lib_limits;
  "lib/password": typeof lib_password;
  "lib/players": typeof lib_players;
  "lib/sessions": typeof lib_sessions;
  "lib/validators": typeof lib_validators;
  players: typeof players;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
