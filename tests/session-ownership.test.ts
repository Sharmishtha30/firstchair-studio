import test from "node:test";
import assert from "node:assert/strict";
import { canReadOwnedPack } from "../convex/sessionOwnership";

test("a browser session can read only its own saved pack", () => {
  assert.equal(canReadOwnedPack("visitor-a", "visitor-a"), true);
  assert.equal(canReadOwnedPack("visitor-b", "visitor-a"), false);
  assert.equal(canReadOwnedPack(null, "visitor-a"), false);
  assert.equal(canReadOwnedPack("visitor-a", undefined), false);
});
