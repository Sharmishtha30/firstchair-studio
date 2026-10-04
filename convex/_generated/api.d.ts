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
import type * as chatgpt from "../chatgpt.js";
import type * as chatgptModel from "../chatgptModel.js";
import type * as chatgptSecurity from "../chatgptSecurity.js";
import type * as chatgptStore from "../chatgptStore.js";
import type * as content from "../content.js";
import type * as demoStories from "../demoStories.js";
import type * as http from "../http.js";
import type * as runs from "../runs.js";
import type * as story from "../story.js";
import type * as validators from "../validators.js";
import type * as writer from "../writer.js";
import type * as writerErrors from "../writerErrors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chatgpt: typeof chatgpt;
  chatgptModel: typeof chatgptModel;
  chatgptSecurity: typeof chatgptSecurity;
  chatgptStore: typeof chatgptStore;
  content: typeof content;
  demoStories: typeof demoStories;
  http: typeof http;
  runs: typeof runs;
  story: typeof story;
  validators: typeof validators;
  writer: typeof writer;
  writerErrors: typeof writerErrors;
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

export declare const components: {
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
