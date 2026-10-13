import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { internal } from "./_generated/api";
import { digest } from "./chatgptSecurity";
import type { DataModel } from "./_generated/dataModel";
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Anonymous,
    ConvexCredentials<DataModel>({
      id: "chatgpt",
      authorize: async (credentials, ctx) => {
        if (
          typeof credentials.ticket !== "string" ||
          typeof credentials.browser !== "string"
        )
          return null;
        const userId = await ctx.runMutation(internal.chatgptStore.redeem, {
          ticketHash: await digest(credentials.ticket),
          browserHash: await digest(credentials.browser),
        });
        return userId ? { userId } : null;
      },
    }),
  ],
});
