import type {CheerioAPI} from 'cheerio';
export function websiteGeometry($:CheerioAPI,css:string){
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(r=>!r[1].includes('@'));
 const vars=new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)].map(m=>[m[1],m[2].trim()]));
 function declaration(node:ReturnType<CheerioAPI>,property:string){let value='';const re=new RegExp(property+'\\s*:\\s*([^;}]+)','i');for(const r of rules)for(const selector of r[1].split(',')){try{if(node.is(selector.trim())){const m=r[2].match(re);if(m)value=m[1].trim();}}catch{}}value=node.attr('style')?.match(re)?.[1]??value;for(let i=0;i<6;i++)value=value.replace(/var\((--[\w-]+)(?:,\s*([^)]*))?\)/g,(_m,k,f)=>vars.get(k)??f??'');return value;}
 const radius=(node:ReturnType<CheerioAPI>)=>declaration(node,'border-radius');
 function pixels(value:string){const n=Number.parseFloat(value);if(!Number.isFinite(n))return 0;return /rem|em/.test(value)?n*16:n;}
 const images=$('[class*=hero] img, main img, section img').toArray().filter(el=>!$(el).closest('header,nav').length&&!/logo|avatar|icon/i.test($(el).attr('alt')??'')).slice(0,6);
 const imageRadii=images.map(el=>{const node=$(el);return radius(node)||radius(node.parent())||radius(node.parent().parent());});
 const circular=imageRadii.filter(v=>v.includes('%')&&pixels(v)>=50||pixels(v)>=999).length;
 const imageShape=circular>=2&&circular>=imageRadii.length/2?'circle' as const:imageRadii.some(v=>pixels(v)>0)?'rounded' as const:'square' as const;
 const action=$('a,button').toArray().find(el=>/book|start|try|shop|join|get started|sign up/i.test($(el).text())&&$(el).text().trim().length<70);
 const actionRadius=action?Math.min(999,pixels(radius($(action)))):0;
 const cards=$('[class*=card],[class*=step],[class*=road]').toArray().slice(0,20).map(el=>pixels(radius($(el)))).filter(n=>n>0&&n<100);
 // Only matching hero containers establish arrangement; an unused framework class is not evidence.
 let hero=$('[class*=hero], [id*=hero], [aria-label*=Hero], [aria-label*=hero]').filter((_i,el)=>$(el).find('h1,h2,img,picture').length>0).first();
 if(!hero.length){let candidate=$('main h1,[role=main] h1,h1').first().parent();for(let i=0;i<9&&candidate.length&&!candidate.is('body,html,main');i++,candidate=candidate.parent()){if(candidate.find('h1').length>1)break;hero=candidate;if(candidate.find('img,picture').length)break;}}
 if(hero.length&&!hero.find('img,picture').length){let parent=hero.parent();for(let i=0;i<4&&parent.length&&!parent.is('main,body,html');i++,parent=parent.parent()){if(parent.find('h1').length>1)break;if(parent.find('img,picture').length){hero=parent;break;}}}
 const columns=declaration(hero,'grid-template-columns'),display=declaration(hero,'display'),direction=declaration(hero,'flex-direction');
 let alignment=declaration(hero,'text-align');let textNode=hero.find('h1,h2').first();for(let i=0;i<5&&textNode.length;i++,textNode=textNode.parent()){const declared=declaration(textNode,'text-align');if(declared){alignment=declared;break;}if(textNode.is(hero))break;}
 const hasImage=hero.find('img,picture').length>0;
 const split=hasImage&&(display==='grid'&&(/repeat\(\s*2\s*,/.test(columns)||columns.trim().split(/\s+/).length===2&&!!columns)||display==='flex'&&direction!=='column'&&direction!=='column-reverse');
 const layoutMotif=split?'split':alignment==='center'?'centered':hasImage?'image-led':hero.length?'editorial':'unknown';
 const imagePosition=hero.length&&hasImage&&hero.find('img,h1,h2').first().is('img')?'top':'bottom';
 return {imageShape,actionRadius,cardRadius:cards.length?Math.min(32,Math.max(...cards)):0,layoutMotif:layoutMotif as 'split'|'centered'|'image-led'|'editorial'|'unknown',imagePosition:imagePosition as 'top'|'bottom',layoutEvidence:hero.length?`Hero structure with ${hasImage?'imagery':'no image'}; matching CSS display=${display||'unknown'}, columns=${columns||'unknown'}, alignment=${alignment||'unknown'}. Approximate source structure; responsive computed layout was not measured.`:'No identifiable hero container; do not infer the composition from unrelated CSS.'};
}
