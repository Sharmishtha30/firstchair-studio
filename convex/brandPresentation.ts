import type {Brand} from './studioTypes';
export function typographyOnly(brand:Pick<Brand,'sourceUrl'>){try{return new URL(brand.sourceUrl).hostname.replace(/^www\./,'')==='foundersfind.club';}catch{return false;}} 
