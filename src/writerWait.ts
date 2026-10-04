export class WriterWaitError extends Error {}
export async function waitForWriter<T>(
  request: Promise<T>,
  milliseconds = 130000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new WriterWaitError(
                "The writer took too long. Your transcript is still in the form. Try again.",
              ),
            ),
          milliseconds,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
