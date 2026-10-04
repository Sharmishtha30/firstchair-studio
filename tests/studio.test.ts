import test from 'node:test';
import assert from 'node:assert/strict';
import {publicAddress,websiteUrl} from '../convex/websiteSafety';
import {checkPosts} from '../convex/studioTypes';
import {foundersPosts,foundersBrand} from '../convex/foundersPack';
test('website fetch rejects private IPv4 and IPv6, credentials and unexpected ports',()=>{
 for(const ip of ['127.0.0.1','10.0.0.8','192.168.1.5','172.16.0.1','169.254.169.254','100.64.1.1','::1','fe80::1','fd00::1','::ffff:127.0.0.1'])assert.equal(publicAddress(ip),false,ip);
 for(const ip of ['8.8.8.8','1.1.1.1','2606:4700:4700::1111'])assert.equal(publicAddress(ip),true,ip);
 for(const url of ['http://localhost','http://server.local','ftp://example.com','https://user:secret@example.com','http://example.com:3210'])assert.throws(()=>websiteUrl(url));
 assert.equal(websiteUrl('foundersfind.club').href,'https://foundersfind.club/');
});
test('three formats have short hooks, complete frames and exact source facts',()=>{
 assert.equal(checkPosts(foundersPosts,foundersBrand.facts).length,3);
 const bad=structuredClone(foundersPosts);bad[0].hook='This hook has far too many words to fit into a catchy opening';assert.throws(()=>checkPosts(bad,foundersBrand.facts),/too long/);
 const invented=structuredClone(foundersPosts);invented[0].sourceFacts=['Guaranteed job in 30 days'];assert.throws(()=>checkPosts(invented,foundersBrand.facts),/unsupported/);
});
