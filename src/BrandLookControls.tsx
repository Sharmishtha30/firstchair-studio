import React from 'react';
import type {Brand,Frame} from '../convex/studioTypes';
import {isPhoto,allowsBrandPhotos,type BrandLook} from '../convex/brandLook';

/** Brand-look slides only: the brand colours in use, and a choice of website photo (or none) for this slide. */
export function BrandLookControls({frame,brand,brandLook,disabled,onImage}:{frame:Frame;brand:Brand;brandLook:BrandLook;disabled:boolean;onImage:(assetKey:string)=>void}){
 if(!frame.look)return null;
 const picked=brandLook.images??[],photos=(brand.assets??[]).filter(isPhoto).sort((a,b)=>(picked.includes(a.key)?picked.indexOf(a.key):99)-(picked.includes(b.key)?picked.indexOf(b.key):99)).slice(0,12);
 const swatches=[['Primary',brandLook.colours?.primary],['Secondary',brandLook.colours?.secondary],['This slide',frame.look.background]] as const;
 return <div className="brand-look-controls">
  <span className="style-label">Brand colours</span>
  <ul className="brand-look-swatches">{swatches.map(([name,colour])=>colour&&<li key={name}><span style={{background:colour}}/>{name}<code>{colour}</code></li>)}</ul>
  {allowsBrandPhotos(brandLook)&&<><span className="style-label">Slide image</span>
  <div className="brand-look-images" role="group" aria-label="Slide image">
   <button type="button" className="no-image" aria-pressed={!frame.assetKey} disabled={disabled} onClick={()=>onImage('')}>No image</button>
   {photos.map(a=><button type="button" key={a.key} aria-pressed={frame.assetKey===a.key} disabled={disabled} title={a.alt} onClick={()=>onImage(a.key)}><img src={a.url} alt={a.alt||'Website photo'}/></button>)}
  </div></>}
 </div>;
}
