import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { reelV, modeV } from "./validators";
import { brandV, postV } from "./studioTypes";
import { authTables } from "@convex-dev/auth/server";
export default defineSchema({
  ...authTables,
  chatgptFlows: defineTable({
    stateHash: v.string(),
    bindingHash: v.string(),
    browserHash: v.string(),
    verifier: v.string(),
    nonce: v.string(),
    redirect: v.string(),
    expiresAt: v.number(),
    clientId: v.optional(v.string()),
  }).index("by_state", ["stateHash"]),
  chatgptTickets: defineTable({
    ticketHash: v.string(),
    browserHash: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_ticket", ["ticketHash"]),
  chatgptConnections: defineTable({
    userId: v.id("users"),
    clientId: v.string(),
    subject: v.string(),
    email: v.string(),
    model: v.string(),
    encrypted: v.optional(v.string()),
    lease: v.optional(v.string()),
    leaseUntil: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_identity", ["clientId", "subject"]),
  packs: defineTable({
    token: v.string(), userId: v.optional(v.id("users")), url: v.string(),
    stage: v.string(), createdAt: v.number(), updatedAt: v.number(),
    brand: v.optional(brandV), posts: v.optional(v.array(postV)),
    mode: v.optional(v.string()), error: v.optional(v.string()),
    sourceText: v.optional(v.string()),
  }).index("by_token", ["token"]),
  runs: defineTable({
    token: v.string(),
    userId: v.optional(v.id("users")),
    transcript: v.string(),
    customerSpeaker: v.optional(v.string()),
    brand: v.string(),
    reels: v.array(reelV),
    mode: modeV,
  }).index("by_token", ["token"]),
});
