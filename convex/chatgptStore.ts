import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
const flowV = {
  stateHash: v.string(),
  bindingHash: v.string(),
  browserHash: v.string(),
  verifier: v.string(),
  nonce: v.string(),
  redirect: v.string(),
  expiresAt: v.number(),
  clientId: v.optional(v.string()),
};
export const createFlow = internalMutation({
  args: flowV,
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("chatgptFlows", args);
    return null;
  },
});
export const consumeFlow = internalMutation({
  args: { stateHash: v.string(), bindingHash: v.string() },
  returns: v.union(v.null(), v.object(flowV)),
  handler: async (ctx, args) => {
    const f = await ctx.db
      .query("chatgptFlows")
      .withIndex("by_state", (q) => q.eq("stateHash", args.stateHash))
      .unique();
    if (!f || f.expiresAt <= Date.now() || f.bindingHash !== args.bindingHash)
      return null;
    await ctx.db.delete(f._id);
    return {
      stateHash: f.stateHash,
      bindingHash: f.bindingHash,
      browserHash: f.browserHash,
      verifier: f.verifier,
      nonce: f.nonce,
      redirect: f.redirect,
      expiresAt: f.expiresAt,
      ...(f.clientId ? { clientId: f.clientId } : {}),
    };
  },
});
export const finish = internalMutation({
  args: {
    clientId: v.string(),
    subject: v.string(),
    email: v.string(),
    encrypted: v.string(),
    model: v.string(),
    ticketHash: v.string(),
    browserHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatgptConnections")
      .withIndex("by_identity", (q) =>
        q.eq("clientId", args.clientId).eq("subject", args.subject),
      )
      .unique();
    let userId = existing?.userId;
    if (!userId) userId = await ctx.db.insert("users", { email: args.email });
    if (existing)
      await ctx.db.patch(existing._id, {
        encrypted: args.encrypted,
        email: args.email,
        model: args.model,
        lease: undefined,
        leaseUntil: undefined,
      });
    else
      await ctx.db.insert("chatgptConnections", {
        userId,
        clientId: args.clientId,
        subject: args.subject,
        email: args.email,
        model: args.model,
        encrypted: args.encrypted,
      });
    await ctx.db.insert("chatgptTickets", {
      ticketHash: args.ticketHash,
      browserHash: args.browserHash,
      userId,
      expiresAt: Date.now() + 60000,
    });
    return null;
  },
});
export const redeem = internalMutation({
  args: { ticketHash: v.string(), browserHash: v.string() },
  returns: v.union(v.null(), v.id("users")),
  handler: async (ctx, args) => {
    const t = await ctx.db
      .query("chatgptTickets")
      .withIndex("by_ticket", (q) => q.eq("ticketHash", args.ticketHash))
      .unique();
    if (!t || t.expiresAt <= Date.now() || t.browserHash !== args.browserHash)
      return null;
    await ctx.db.delete(t._id);
    return t.userId;
  },
});
const connectionV = v.object({
  _id: v.id("chatgptConnections"),
  _creationTime: v.number(),
  userId: v.id("users"),
  clientId: v.string(),
  subject: v.string(),
  email: v.string(),
  model: v.string(),
  encrypted: v.optional(v.string()),
  lease: v.optional(v.string()),
  leaseUntil: v.optional(v.number()),
});
export const get = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(v.null(), connectionV),
  handler: async (ctx, args) =>
    ctx.db
      .query("chatgptConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first(),
});
export const lock = internalMutation({
  args: { userId: v.id("users"), lease: v.string() },
  returns: v.union(v.null(), connectionV),
  handler: async (ctx, args) => {
    const c = await ctx.db
      .query("chatgptConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (!c?.encrypted) return null;
    if ((c.leaseUntil ?? 0) > Date.now())
      throw new Error(
        "Your ChatGPT connection is refreshing. Try again in a moment.",
      );
    await ctx.db.patch(c._id, {
      lease: args.lease,
      leaseUntil: Date.now() + 60000,
    });
    return c;
  },
});
export const release = internalMutation({
  args: {
    userId: v.id("users"),
    lease: v.string(),
    encrypted: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const c = await ctx.db
      .query("chatgptConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (c?.lease === args.lease)
      await ctx.db.patch(c._id, {
        lease: undefined,
        leaseUntil: undefined,
        ...(args.encrypted ? { encrypted: args.encrypted } : {}),
      });
    return null;
  },
});
export const clear = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const c = await ctx.db
      .query("chatgptConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (c)
      await ctx.db.patch(c._id, {
        encrypted: undefined,
        lease: undefined,
        leaseUntil: undefined,
      });
    return null;
  },
});
