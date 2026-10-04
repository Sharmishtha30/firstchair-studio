// Reject private addresses before any website request, including every redirect.
export function publicAddress(ip:string) {
  const s=ip.toLowerCase();
  if(s.includes(':')) return !/^(::|fc|fd|fe[89ab]|ff)/.test(s) && !s.includes('ffff:');
  const a=s.split('.').map(Number);
  if(a.length!==4 || a.some(n=>!Number.isInteger(n)||n<0||n>255)) return false;
  return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===192&&a[1]===168||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]===198&&(a[1]===18||a[1]===19));
}
export function websiteUrl(input:string) {
  const url=new URL(input.includes('://')?input:'https://'+input);
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port&& !['80','443'].includes(url.port)) throw new Error('Enter a public website address.');
  if(url.hostname==='localhost'||url.hostname.endsWith('.local')) throw new Error('Local and private websites are not supported.');
  url.hash='';return url;
}
