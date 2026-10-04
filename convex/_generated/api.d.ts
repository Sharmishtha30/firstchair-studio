/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adInspiration from "../adInspiration.js";
import type * as adStore from "../adStore.js";
import type * as auth from "../auth.js";
import type * as brandPalette from "../brandPalette.js";
import type * as brandPresentation from "../brandPresentation.js";
import type * as brandStyle from "../brandStyle.js";
import type * as brandUpload from "../brandUpload.js";
import type * as chatgpt from "../chatgpt.js";
import type * as chatgptModel from "../chatgptModel.js";
import type * as chatgptSecurity from "../chatgptSecurity.js";
import type * as chatgptStore from "../chatgptStore.js";
import type * as content from "../content.js";
import type * as creativeImages from "../creativeImages.js";
import type * as creativeTypes from "../creativeTypes.js";
import type * as demoStories from "../demoStories.js";
import type * as foundersPack from "../foundersPack.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as media from "../media.js";
import type * as publicWebsite from "../publicWebsite.js";
import type * as runs from "../runs.js";
import type * as seedance from "../seedance.js";
import type * as seedanceClient from "../seedanceClient.js";
import type * as seedanceRequest from "../seedanceRequest.js";
import type * as seedream from "../seedream.js";
import type * as seedreamClient from "../seedreamClient.js";
import type * as story from "../story.js";
import type * as streamResult from "../streamResult.js";
import type * as studio from "../studio.js";
import type * as studioTypes from "../studioTypes.js";
import type * as studioVerification from "../studioVerification.js";
import type * as studioWriter from "../studioWriter.js";
import type * as validators from "../validators.js";
import type * as website from "../website.js";
import type * as websiteAssets from "../websiteAssets.js";
import type * as websiteIdentity from "../websiteIdentity.js";
import type * as websiteSafety from "../websiteSafety.js";
import type * as writer from "../writer.js";
import type * as writerErrors from "../writerErrors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adInspiration: typeof adInspiration;
  adStore: typeof adStore;
  auth: typeof auth;
  brandPalette: typeof brandPalette;
  brandPresentation: typeof brandPresentation;
  brandStyle: typeof brandStyle;
  brandUpload: typeof brandUpload;
  chatgpt: typeof chatgpt;
  chatgptModel: typeof chatgptModel;
  chatgptSecurity: typeof chatgptSecurity;
  chatgptStore: typeof chatgptStore;
  content: typeof content;
  creativeImages: typeof creativeImages;
  creativeTypes: typeof creativeTypes;
  demoStories: typeof demoStories;
  foundersPack: typeof foundersPack;
  http: typeof http;
  images: typeof images;
  media: typeof media;
  publicWebsite: typeof publicWebsite;
  runs: typeof runs;
  seedance: typeof seedance;
  seedanceClient: typeof seedanceClient;
  seedanceRequest: typeof seedanceRequest;
  seedream: typeof seedream;
  seedreamClient: typeof seedreamClient;
  story: typeof story;
  streamResult: typeof streamResult;
  studio: typeof studio;
  studioTypes: typeof studioTypes;
  studioVerification: typeof studioVerification;
  studioWriter: typeof studioWriter;
  validators: typeof validators;
  website: typeof website;
  websiteAssets: typeof websiteAssets;
  websiteIdentity: typeof websiteIdentity;
  websiteSafety: typeof websiteSafety;
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
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
};
