import {test} from 'node:test';
import assert from 'node:assert/strict';
import {websiteReadLimit} from '../convex/websiteReadLimit';
test('storefront HTML fits while other download limits remain bounded',()=>{assert.ok(3_217_551<websiteReadLimit('text/html'));assert.ok(9_233_427>websiteReadLimit('text/html'));assert.equal(websiteReadLimit('text/css'),2_000_000);assert.equal(websiteReadLimit('font/'),2_000_000);});
