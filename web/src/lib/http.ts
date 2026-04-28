export async function parseJsonSafely(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getApiErrorMessage(
  response: Response,
  body: unknown,
  fallback: string,
): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (response.status >= 500) return "Server error. Please try again in a moment.";
  if (response.status === 400) return "Invalid input. Please check the form values.";
  if (response.status === 404) return "Requested endpoint was not found.";

  return fallback;
}
