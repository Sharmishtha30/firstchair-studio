import test from 'node:test';
import assert from 'node:assert/strict';
import {z} from 'zod';
import {inspectedDestinationSchema} from '../convex/inspectedDestinations';
test('model destination choices preserve the inspected product query rather than inventing a shorter URL',()=>{
 const home='https://example.com/',product='https://example.com/products/bar?sku_id=variant_123&category=bars';
 const schema=inspectedDestinationSchema([home,product,home]);
 assert.equal(schema.parse(product),product);assert.equal(schema.parse(home),home);
 assert.equal(schema.safeParse('https://example.com/products/bar').success,false);
 assert.equal(schema.safeParse('https://other.example/products/bar').success,false);
 assert.deepEqual(z.toJSONSchema(schema).enum,[home,product]);
});
test('a destination list cannot pretend the submitted page was inspected when no page evidence exists',()=>{
 assert.throws(()=>inspectedDestinationSchema([]),/No inspected/);
});
