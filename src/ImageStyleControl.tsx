import React,{useId,useRef} from 'react';
import {imageSizes,type ImageStyle,type Box} from '../convex/appearance';
export function ImageStyleControl({box,value,disabled,onChange}:{box:Box;value?:ImageStyle;disabled:boolean;onChange:(style:ImageStyle)=>void}){
 const id=useId(),trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null),current=value??{size:'Full',mode:'fit'};
 return <><button ref={trigger} type="button" className="image-style-target" aria-label="Image size and crop" title="Adjust image" disabled={disabled} popoverTarget={id} style={{left:`${box.x/1080*100}%`,top:`${box.y/1350*100}%`,width:`${box.width/1080*100}%`,height:`${box.height/1350*100}%`}}><span>Adjust image</span></button>
 <div ref={panel} id={id} popover="auto" className="text-style-popover image-style-popover" aria-label="Image style" onToggle={e=>{if(e.newState==='open'){const r=trigger.current?.getBoundingClientRect();if(r&&panel.current){panel.current.style.left=Math.max(12,Math.min(r.right-268,innerWidth-280))+'px';panel.current.style.top=Math.max(12,Math.min(r.top+28,innerHeight-250))+'px';}}}}>
 <div className="style-popover-title">Image<button type="button" aria-label="Close image style" popoverTarget={id} popoverTargetAction="hide"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="m4 4 8 8M12 4l-8 8"/></svg></button></div>
 <span className="style-label">Size</span><div className="size-presets" role="group" aria-label="Image size">{imageSizes.map(size=><button type="button" key={size} aria-pressed={current.size===size} disabled={disabled} onClick={()=>onChange({...current,size})}>{size}</button>)}</div>
 <span className="style-label">Image fit</span><div className="size-presets image-fit" role="group" aria-label="Image fit">{(['fit','fill'] as const).map(mode=><button type="button" key={mode} aria-pressed={current.mode===mode} disabled={disabled} onClick={()=>onChange({...current,mode})}>{mode==='fit'?'Fit':'Fill'}</button>)}</div><p>{current.mode==='fit'?'Whole image visible.':'Cropped to fill the image space.'}</p>
 </div></>;
}
