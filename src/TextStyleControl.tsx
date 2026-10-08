import React,{useEffect,useId,useRef,useState} from 'react';
import type {Brand} from '../convex/studioTypes';
import {fontChoices,sizePresets,type TextStyle,type TextField,type TextFont} from '../convex/textStyles';
import {brandFont} from './artwork';
import {editorFont} from './textStyleFonts';
import './text-style.css';
export function TextStyleControl({field,brand,value,disabled,onChange}:{field:TextField;brand:Brand;value?:TextStyle;disabled:boolean;onChange:(style:TextStyle)=>void}){
 const id=useId(),panel=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),[fonts,setFonts]=useState<Partial<Record<TextFont,string>>>({}),[expanded,setExpanded]=useState(false),[fontError,setFontError]=useState('');
 const label=field==='heading'?'Headline':'Supporting text',current=value??{font:'brand',size:'M'};
 const brandName=(field==='body'?brand.style?.bodyFont:undefined)||brand.style?.fontName||brand.style?.sourceFont||'Inter';
 useEffect(()=>{let alive=true;void Promise.all(fontChoices.map(async font=>[font,font==='brand'?await brandFont(brand,field==='body'&&!!brand.style?.bodyRegularUrl):await editorFont(font)] as const)).then(entries=>{if(alive)setFonts(Object.fromEntries(entries));}).catch(()=>{if(alive)setFontError('Fonts could not load. Reopen the editor to retry.');});return()=>{alive=false;};},[brand.style?.regularUrl,brand.style?.bodyRegularUrl,field]);
 return <span className="text-style-control"><button ref={trigger} type="button" className="aa-button" aria-label={`${label} text style`} popoverTarget={id} disabled={disabled}>Aa</button>
 <div ref={panel} id={id} popover="auto" className="text-style-popover" aria-label={`${label} style`} onToggle={e=>{if(e.newState==='open'){setExpanded(false);const rect=trigger.current?.getBoundingClientRect();if(rect&&panel.current){panel.current.style.left=Math.max(12,Math.min(rect.right-268,window.innerWidth-280))+'px';panel.current.style.top=Math.max(12,Math.min(rect.bottom+8,window.innerHeight-360))+'px';}}}}>
 <div className="style-popover-title">{label}<button type="button" aria-label="Close text style" popoverTarget={id} popoverTargetAction="hide"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="m4 4 8 8M12 4l-8 8"/></svg></button></div>
 <span className="style-label" id={`${id}-font-label`}>Font</span>
 <button type="button" className="font-picker" aria-haspopup="listbox" aria-expanded={expanded} aria-labelledby={`${id}-font-label ${id}-font-value`} onClick={()=>setExpanded(!expanded)} disabled={disabled}>
 <span id={`${id}-font-value`} style={{fontFamily:fonts[current.font]}}>{current.font==='brand'?brandName.split(',')[0].replace(/["']/g,''):current.font}</span><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="m4 6 4 4 4-4"/></svg></button>
 {expanded&&<div className="font-options" role="listbox" aria-label={`${label} font`} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const items=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role=option]'));const i=items.indexOf(document.activeElement as HTMLButtonElement);items[e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:items.length-1))%items.length]?.focus();}}}>
 {fontChoices.map(font=><button type="button" role="option" aria-selected={current.font===font} key={font} style={{fontFamily:fonts[font]}} disabled={disabled||!fonts[font]} onClick={()=>{onChange({...current,font});setExpanded(false);}}>{font==='brand'?brandName.split(',')[0].replace(/["']/g,''):font}{font==='brand'&&<small>Brand font</small>}</button>)}
 </div>}
 <span className="style-label">Size</span><div className="size-presets" role="group" aria-label={`${label} size`}>{sizePresets.map(size=><button type="button" key={size} aria-pressed={value?.size===size} disabled={disabled} onClick={()=>onChange({...current,size})}>{size}</button>)}</div>
 {fontError&&<p role="alert">{fontError}</p>}
 </div></span>;
}
