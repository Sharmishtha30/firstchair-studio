import type {Brand} from './studioTypes';
export function typographyOnly(brand:Pick<Brand,'sourceUrl'>){try{return new URL(brand.sourceUrl).hostname.replace(/^www\./,'')==='foundersfind.club';}catch{return false;}} 

// Drafts and approved posts must use the same observed website identity.
export function presentBrand(brand:Brand, observed:{sitePalette?:Brand['palette'];siteStyle?:Brand['style']}){
 return {...brand,palette:observed.sitePalette??brand.palette,style:observed.siteStyle??brand.style};
}
