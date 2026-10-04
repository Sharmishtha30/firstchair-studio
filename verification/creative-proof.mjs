import {createRequire} from 'node:module';const sharp=createRequire('/Users/sam/build-sprint-app/package.json')('sharp');
import fs from 'node:fs/promises';
const root='/Users/sam/build-sprint-app/verification';
for(const [slug,short] of [['foundersfind-club','founders'],['www-deathwishcoffee-com','coffee'],['www-maid2clean-co-uk','maid']]){
 const folder=root+'/creative-'+slug+'-assets';const files=(await fs.readdir(folder)).filter(f=>f.endsWith('.png')).sort();
 const tiles=await Promise.all(files.map(async(f,i)=>({input:await sharp(folder+'/'+f).resize(360,450).png().toBuffer(),left:(i%4)*360,top:Math.floor(i/4)*450})));
 await sharp({create:{width:1440,height:1350,channels:3,background:'#ddd'}}).composite(tiles).png().toFile(root+'/creative-'+short+'-contact.png');
}
