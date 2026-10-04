// streamObject's object promise settles only after its lazy stream is consumed.
export async function finishedObject<T>(stream: {
  object: Promise<T>;
  fullStream: AsyncIterable<unknown>;
}): Promise<T> {
  const object = stream.object;
  // The stream can reject the object before the reader has reached its end.
  void object.catch(() => {});
  for await (const _part of stream.fullStream) {
    // Drain on the server; only validated completed objects reach the UI.
  }
  return await object;
}
