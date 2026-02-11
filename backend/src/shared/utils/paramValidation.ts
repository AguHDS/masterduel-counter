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

/**
 * Extracts and validates a request parameter as a number
 * @param param Parameter from req.params, req.query, etc.
 * @returns Number validated or null if invalid
 */
export function validateNumberParam(
  param: string | string[] | undefined,
): number | null {
  if (!param) {
    return null;
  }

  const paramString = Array.isArray(param) ? param[0] : param;

  if (typeof paramString !== "string" || paramString.trim().length === 0) {
    return null;
  }

  const trimmed = paramString.trim();
  const num = Number(trimmed);

  // Check if it's a valid number and a positive integer
  if (Number.isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return null;
  }

  return num;
}
