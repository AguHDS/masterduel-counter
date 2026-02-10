/**
 * Extracts and validates a request parameter as a string
 * @param param Parameter for req.params, req.query, etc.
 * @returns String validated or null if invalid
 */
export function validateStringParam(
  param: string | string[] | undefined,
): string | null {
  if (!param) {
    return null;
  }

  const paramString = Array.isArray(param) ? param[0] : param;

  if (typeof paramString !== "string" || paramString.trim().length === 0) {
    return null;
  }

  return paramString.trim();
}
