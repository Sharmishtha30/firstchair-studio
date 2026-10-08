import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateWebsiteResponse } from '../convex/publicWebsite';

test('a blocked website is not reported as a file even when its error is JSON', () => {
  assert.throws(() => validateWebsiteResponse(403, 'application/json', 'text/html'), /blocks automated reading.*business text/i);
  assert.throws(() => validateWebsiteResponse(429, 'text/plain', 'text/html'), /HTTP 429/);
});

test('successful responses still reject files and accept webpages', () => {
  assert.throws(() => validateWebsiteResponse(200, 'application/pdf', 'text/html'), /Enter a webpage/);
  assert.doesNotThrow(() => validateWebsiteResponse(200, 'text/html; charset=utf-8', 'text/html'));
  assert.doesNotThrow(() => validateWebsiteResponse(200, 'font/woff2', 'font/'));
});
