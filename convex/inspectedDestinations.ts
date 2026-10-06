import {z} from 'zod';
/** Restrict model links at generation time, preserving inspected path and query. */
export function inspectedDestinationSchema(urls: string[]) {
 const unique=[...new Set(urls)];
 if(!unique.length)throw new Error('No inspected website page is available for a next action.');
 return z.enum(unique as [string,...string[]]);
}
