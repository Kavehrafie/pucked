// lib/utils.ts
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export async function tryCatch<T, E = Error>(
  fn: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as E };
  }
}