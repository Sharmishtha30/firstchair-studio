// Choose an actually declared responsive image, never invent a higher-resolution URL.
export function websiteImageSource(src:string|undefined,srcset:string|undefined){
 const choices=[...(srcset??'').matchAll(/(\S+)\s+(\d+(?:\.\d+)?)(w|x)(?:\s*,\s*|$)/g)].map(m=>({url:m[1],size:Number(m[2]),unit:m[3]}));
 const widths=choices.filter(c=>c.unit==='w').sort((a,b)=>a.size-b.size);
 if(widths.length){return (widths.find(c=>c.size>=1000&&c.size<=1600)??widths.filter(c=>c.size<=1600).at(-1)??widths[0]).url;}
 const densities=choices.filter(c=>c.unit==='x').sort((a,b)=>a.size-b.size);return (densities.filter(c=>c.size<=2).at(-1)??densities[0])?.url??src;
}
