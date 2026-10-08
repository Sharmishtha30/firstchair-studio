import React from 'react';
import type {Brand} from '../convex/studioTypes';
import {contrastRatio,readableSwatch,validColour} from '../convex/appearance';
export function ColourControl({brand,colour,background,disabled,onChange}:{brand:Brand;colour:string;background:string;disabled:boolean;onChange:(colour:string)=>void}){
 const palette=brand.palette;
 const swatches=[...new Set([palette?.primary,palette?.accent,palette?.ink,palette?.paper,...(palette?.observed??[]),'#ffffff','#101010'].filter((c):c is string=>!!c&&validColour(c)).map(c=>c.toLowerCase()))];
 const poor=contrastRatio(colour,background)<4.5,suggestion=poor?readableSwatch(colour,background,swatches):undefined;
 return <div className="colour-control"><span className="style-label">Text colour</span><div className="colour-swatches" role="group" aria-label="Text colour">
 {swatches.map(c=><button type="button" className="colour-swatch" key={c} aria-label={`Colour ${c}`} aria-pressed={colour.toLowerCase()===c} title={c} disabled={disabled} onClick={()=>onChange(c)} style={{'--swatch':c} as React.CSSProperties}/>)}
 <label className="custom-colour">Custom<input type="color" aria-label="Custom text colour" value={colour} disabled={disabled} onChange={e=>onChange(e.target.value)}/></label>
 </div>{poor&&<p className="contrast-warning" role="status">Low contrast—this text may be hard to read.{suggestion&&<> <button type="button" disabled={disabled} onClick={()=>onChange(suggestion)}>Use {suggestion}<span style={{background:suggestion}}/></button></>}</p>}</div>;
}
