import fs from 'node:fs/promises';import sharp from 'sharp';import {unzipSync,strFromU8} from 'fflate';
const root='verification/quality';await fs.mkdir(root+'/after',{recursive:true});
for(const name of ['founders','coffee','maid']){
 const before=JSON.parse(await fs.readFile(root+'/before/'+name+'-copy.json','utf8')),after=JSON.parse(await fs.readFile('verification/quality-after-'+name+'-pack.json','utf8'));
 const old=unzipSync(await fs.readFile(root+'/before/'+name+'-pack.zip')),current=unzipSync(await fs.readFile('verification/quality-after-'+name+'.zip'));
 await fs.writeFile(root+'/after/'+name+'-copy.json',JSON.stringify(after,null,2));await fs.writeFile(root+'/after/'+name+'-captions.txt',strFromU8(current['captions.txt']));
 const paths=['instagram/carousel/01.png','instagram/static/01.png'];const inputs=[];
 for(const [side,files] of [['before',old],['after',current]])for(const [i,path] of paths.entries()){if(!files[path])throw Error('Missing '+path);await fs.writeFile(`${root}/${side}/${name}-${i===0?'cover':'static'}.png`,files[path]);inputs.push({input:await sharp(files[path]).resize(360,450).png().toBuffer(),left:(side==='before'?0:720)+i*360,top:48});}
 const labels=Buffer.from('<svg width="1440" height="498"><rect width="1440" height="498" fill="#e8e8e8"/><text x="20" y="31" font-family="Arial" font-size="24">BEFORE · CAROUSEL COVER + STATIC</text><text x="740" y="31" font-family="Arial" font-size="24">AFTER · CAROUSEL COVER + STATIC</text></svg>');await sharp(labels).composite(inputs).png().toFile(root+'/'+name+'-before-after.png');
 let md=`# ${after.brand.name}: full copy before and after\n\nWebsite: ${after.url}\n\nThese are saved actual outputs, not reconstructed examples. Designs are in ${name}-before-after.png and the complete exported contact sheets.\n`;
 for(const [side,pack] of [['Before',before],['After',after]]){md+=`\n## ${side}\n`;for(const p of pack.posts.filter(p=>p.format!=='reel')){md+=`\n### ${p.platform} ${p.format}\n\nOpening: ${p.hook}\n`;for(const [i,f] of p.frames.entries()){md+=`\nSlide ${i+1}: **${f.heading}**\n\n${f.body}\n`;for(const item of f.items??[])md+=`\n- ${item.label}: ${item.detail}\n`;if(f.design?.takeaway)md+=`\nTakeaway: ${f.design.takeaway}\n`;md+=`\nLayout: ${f.design?.layout??f.composition}; image: ${f.assetKey||'none'}\n`;}md+=`\nCaption:\n\n${p.caption}\n\nNext action: ${p.destination??pack.url}\n`;}}
 await fs.writeFile(root+'/'+name+'-copy-before-after.md',md);console.log('Saved exact copy and exported design comparison',name);
}
