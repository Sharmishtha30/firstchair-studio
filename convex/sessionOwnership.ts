export function canReadOwnedPack(readerId: string | null, ownerId: string | undefined) {
  return readerId !== null && ownerId !== undefined && readerId === ownerId;
}
