// HTML often includes storefront markup and embedded page data. Keep other downloads smaller.
export function websiteReadLimit(mime:string):number{return mime==='text/html'?8_000_000:2_000_000;}
