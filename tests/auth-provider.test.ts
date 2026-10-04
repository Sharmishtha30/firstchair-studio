import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
function Probe() {
  const { signIn } = useAuthActions();
  const { isLoading } = useConvexAuth();
  assert.equal(typeof signIn, "function");
  return React.createElement(
    "span",
    null,
    isLoading ? "Loading connection" : "Connection ready",
  );
}
test("the auth provider and page hooks share one React runtime", () => {
  const client = new ConvexReactClient("http://127.0.0.1:3210");
  const html = renderToString(
    React.createElement(
      ConvexAuthProvider,
      { client },
      React.createElement(Probe),
    ),
  );
  assert.ok(html.includes("Loading connection"));
  void client.close();
});
