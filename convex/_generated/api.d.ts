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
import type * as appearance from "../appearance.js";
import type * as articleInput from "../articleInput.js";
import type * as auth from "../auth.js";
import type * as brandAcceptance from "../brandAcceptance.js";
import type * as brandContext from "../brandContext.js";
import type * as brandLook from "../brandLook.js";
import type * as brandPalette from "../brandPalette.js";
import type * as brandPresentation from "../brandPresentation.js";
import type * as brandStyle from "../brandStyle.js";
import type * as brandUpload from "../brandUpload.js";
import type * as businessRecommendations from "../businessRecommendations.js";
import type * as callMaking from "../callMaking.js";
import type * as callPrivacy from "../callPrivacy.js";
import type * as carouselEditor from "../carouselEditor.js";
import type * as carouselEdits from "../carouselEdits.js";
import type * as carouselExamples from "../carouselExamples.js";
import type * as carouselUpload from "../carouselUpload.js";
import type * as chatgpt from "../chatgpt.js";
import type * as chatgptModel from "../chatgptModel.js";
import type * as chatgptSecurity from "../chatgptSecurity.js";
import type * as chatgptStore from "../chatgptStore.js";
import type * as content from "../content.js";
import type * as contentBatches from "../contentBatches.js";
import type * as contentFormatting from "../contentFormatting.js";
import type * as contentPolicy from "../contentPolicy.js";
import type * as contentRowRepair from "../contentRowRepair.js";
import type * as contentWriter from "../contentWriter.js";
import type * as copyLenses from "../copyLenses.js";
import type * as copyPolicy from "../copyPolicy.js";
import type * as creativeDensity from "../creativeDensity.js";
import type * as creativeImages from "../creativeImages.js";
import type * as creativeTypes from "../creativeTypes.js";
import type * as customerCall from "../customerCall.js";
import type * as demoStories from "../demoStories.js";
import type * as editAllowance from "../editAllowance.js";
import type * as foundersPack from "../foundersPack.js";
import type * as generationAvailability from "../generationAvailability.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as inspectedDestinations from "../inspectedDestinations.js";
import type * as logoColours from "../logoColours.js";
import type * as media from "../media.js";
import type * as onboarding from "../onboarding.js";
import type * as openaiLimits from "../openaiLimits.js";
import type * as openaiModel from "../openaiModel.js";
import type * as publicWebsite from "../publicWebsite.js";
import type * as reelProjects from "../reelProjects.js";
import type * as referenceLibrary from "../referenceLibrary.js";
import type * as requestDeadline from "../requestDeadline.js";
import type * as runs from "../runs.js";
import type * as seedance from "../seedance.js";
import type * as seedanceClient from "../seedanceClient.js";
import type * as seedanceRequest from "../seedanceRequest.js";
import type * as seedream from "../seedream.js";
import type * as seedreamClient from "../seedreamClient.js";
import type * as sessionOwnership from "../sessionOwnership.js";
import type * as sourceWriterFailure from "../sourceWriterFailure.js";
import type * as story from "../story.js";
import type * as streamResult from "../streamResult.js";
import type * as studio from "../studio.js";
import type * as studioTypes from "../studioTypes.js";
import type * as studioVerification from "../studioVerification.js";
import type * as studioWriter from "../studioWriter.js";
import type * as textModel from "../textModel.js";
import type * as textStyles from "../textStyles.js";
import type * as validators from "../validators.js";
import type * as website from "../website.js";
import type * as websiteAssets from "../websiteAssets.js";
import type * as websiteBrandEvidence from "../websiteBrandEvidence.js";
import type * as websiteColours from "../websiteColours.js";
import type * as websiteDiagrams from "../websiteDiagrams.js";
import type * as websiteGeometry from "../websiteGeometry.js";
import type * as websiteIdentity from "../websiteIdentity.js";
import type * as websiteImageSource from "../websiteImageSource.js";
import type * as websiteNetworkRetry from "../websiteNetworkRetry.js";
import type * as websiteProducts from "../websiteProducts.js";
import type * as websiteReadLimit from "../websiteReadLimit.js";
import type * as websiteSafety from "../websiteSafety.js";
import type * as websiteTypography from "../websiteTypography.js";
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
  appearance: typeof appearance;
  articleInput: typeof articleInput;
  auth: typeof auth;
  brandAcceptance: typeof brandAcceptance;
  brandContext: typeof brandContext;
  brandLook: typeof brandLook;
  brandPalette: typeof brandPalette;
  brandPresentation: typeof brandPresentation;
  brandStyle: typeof brandStyle;
  brandUpload: typeof brandUpload;
  businessRecommendations: typeof businessRecommendations;
  callMaking: typeof callMaking;
  callPrivacy: typeof callPrivacy;
  carouselEditor: typeof carouselEditor;
  carouselEdits: typeof carouselEdits;
  carouselExamples: typeof carouselExamples;
  carouselUpload: typeof carouselUpload;
  chatgpt: typeof chatgpt;
  chatgptModel: typeof chatgptModel;
  chatgptSecurity: typeof chatgptSecurity;
  chatgptStore: typeof chatgptStore;
  content: typeof content;
  contentBatches: typeof contentBatches;
  contentFormatting: typeof contentFormatting;
  contentPolicy: typeof contentPolicy;
  contentRowRepair: typeof contentRowRepair;
  contentWriter: typeof contentWriter;
  copyLenses: typeof copyLenses;
  copyPolicy: typeof copyPolicy;
  creativeDensity: typeof creativeDensity;
  creativeImages: typeof creativeImages;
  creativeTypes: typeof creativeTypes;
  customerCall: typeof customerCall;
  demoStories: typeof demoStories;
  editAllowance: typeof editAllowance;
  foundersPack: typeof foundersPack;
  generationAvailability: typeof generationAvailability;
  http: typeof http;
  images: typeof images;
  inspectedDestinations: typeof inspectedDestinations;
  logoColours: typeof logoColours;
  media: typeof media;
  onboarding: typeof onboarding;
  openaiLimits: typeof openaiLimits;
  openaiModel: typeof openaiModel;
  publicWebsite: typeof publicWebsite;
  reelProjects: typeof reelProjects;
  referenceLibrary: typeof referenceLibrary;
  requestDeadline: typeof requestDeadline;
  runs: typeof runs;
  seedance: typeof seedance;
  seedanceClient: typeof seedanceClient;
  seedanceRequest: typeof seedanceRequest;
  seedream: typeof seedream;
  seedreamClient: typeof seedreamClient;
  sessionOwnership: typeof sessionOwnership;
  sourceWriterFailure: typeof sourceWriterFailure;
  story: typeof story;
  streamResult: typeof streamResult;
  studio: typeof studio;
  studioTypes: typeof studioTypes;
  studioVerification: typeof studioVerification;
  studioWriter: typeof studioWriter;
  textModel: typeof textModel;
  textStyles: typeof textStyles;
  validators: typeof validators;
  website: typeof website;
  websiteAssets: typeof websiteAssets;
  websiteBrandEvidence: typeof websiteBrandEvidence;
  websiteColours: typeof websiteColours;
  websiteDiagrams: typeof websiteDiagrams;
  websiteGeometry: typeof websiteGeometry;
  websiteIdentity: typeof websiteIdentity;
  websiteImageSource: typeof websiteImageSource;
  websiteNetworkRetry: typeof websiteNetworkRetry;
  websiteProducts: typeof websiteProducts;
  websiteReadLimit: typeof websiteReadLimit;
  websiteSafety: typeof websiteSafety;
  websiteTypography: typeof websiteTypography;
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
