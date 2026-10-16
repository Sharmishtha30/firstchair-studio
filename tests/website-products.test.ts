import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {hasProductOffer,selectWebsiteImages} from '../convex/websiteProducts';
import {classifyD2C} from '../convex/brandLook';

const product={
 '@context':'http://schema.org/','@type':'Product',name:'AHA 30% + BHA 2% Peeling Solution',
 offers:{'@type':'Offer',priceCurrency:'USD',price:'11.40'},
};
const html=(value:unknown)=>load('<script type="application/ld+json">'+JSON.stringify(value)+'</script>');

test('a product offer identifies a locale-prefixed .html product page without guessing from its address',()=>{
 const url='https://theordinary.com/en-in/aha-30-bha-2-peeling-solution-exfoliator-100400.html';
 const isProduct=hasProductOffer(html(product));
 assert.equal(isProduct,true);
 const result=classifyD2C({category:'D2C brand',assets:[],pageUrls:[url],productPageUrls:isProduct?[url]:[]});
 assert.equal(result.d2c,true);
 assert.equal(result.reason,'D2C brand: category "D2C brand", 0 product images, 1 product page.');
});

test('product evidence handles graph and array forms while ignoring malformed scripts and review mentions',()=>{
 assert.equal(hasProductOffer(html({'@graph':[{'@type':'WebPage',mainEntity:{...product,'@type':['Thing','https://schema.org/Product'],offers:[product.offers]}}]})),true);
 assert.equal(hasProductOffer(html([product])),true);
 assert.equal(hasProductOffer(load('<script type="application/ld+json">invalid</script>'+html(product).html())),true);
 for(const value of [{'@type':'FAQPage'}, {'@type':'Review',itemReviewed:product},{...product,offers:undefined},{...product,offers:{'@type':'Offer'}}, {'@type':'Product',offers:product.offers}]){
  assert.equal(hasProductOffer(html(value)),false);
 }
 assert.equal(classifyD2C({category:'D2C brand',assets:[],pageUrls:['https://example.com/blog/skincare-100400.html'],productPageUrls:[]}).d2c,false);
 // Uninspected URLs and repeated evidence must not inflate the product-page count.
 assert.match(classifyD2C({category:'D2C brand',assets:[],pageUrls:['https://example.com/products/cream'],productPageUrls:['https://example.com/products/cream','https://example.com/products/cream','https://elsewhere.test/product']}).reason,/1 product page\.$/);
});

test('linked-page product photos survive both download and import limits ahead of homepage backgrounds',()=>{
 const backgrounds=Array.from({length:40},(_,i)=>({url:'https://example.com/background-'+i+'.jpg',role:'website background',score:9}));
 const products=Array.from({length:5},(_,i)=>({url:'https://example.com/product-'+i+'.jpg',role:'product',score:7}));
 const input=[...backgrounds,...products];
 const downloads=selectWebsiteImages(input,36);
 assert.equal(downloads.length,36);
 assert.deepEqual(downloads.slice(0,5),products);
 const imports=selectWebsiteImages(downloads,24-8); // Existing diagram reservation stays intact.
 assert.equal(imports.length,16);
 assert.deepEqual(imports.slice(0,5),products);
 assert.deepEqual(input,[...backgrounds,...products]);
});

test('a shared image keeps its product evidence and non-product order stays stable',()=>{
 const editorial={url:'https://example.com/cream.jpg',role:'editorial',score:14};
 const product={...editorial,role:'product',score:7};
 const cover={url:'https://example.com/cover.jpg',role:'website cover',score:9};
 const background={url:'https://example.com/background.jpg',role:'website background',score:9};
 assert.deepEqual(selectWebsiteImages([editorial,cover,background,product],36),[product,cover,background]);
 assert.deepEqual(selectWebsiteImages([cover,background],24),[cover,background]);
});
