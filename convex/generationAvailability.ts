// Anonymous preview packs are curated; they must never enter fresh writing.
export function generationUnavailable(url:string,userId?:string|null){
 if(userId||new URL(url).hostname.replace(/^www\./,'')==='foundersfind.club')return undefined;
 return 'Fresh posts are not connected on this public preview yet. Your website has not been turned into posts. You can view the sample instead.';
}
