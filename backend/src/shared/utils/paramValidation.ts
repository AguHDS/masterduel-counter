/**
 * Extracts and validates a request parameter as a string
 * @param param Parameter for req.params, req.query, req.body, etc.
 * @returns String validated or null if invalid
 */
export function validateStringParam(
  param: string | number | string[] | undefined,
): string | null {
  if (param === undefined || param === null) {
    return null;
  }

  let paramString: string;

  if (Array.isArray(param)) {
    paramString = param[0];
  } else if (typeof param === "number") {
    paramString = param.toString();
  } else {
    paramString = param;
  }

  if (typeof paramString !== "string" || paramString.trim().length === 0) {
    return null;
  }

  return paramString.trim();
}

/**
 * Extracts and validates a request parameter as a number
 * @param param Parameter from req.params, req.query, req.body, etc.
 * @returns Number validated or null if invalid
 */
export function validateNumberParam(
  param: string | number | string[] | undefined,
): number | null {
  if (param === undefined || param === null) {
    return null;
  }

  let paramString: string;

  if (Array.isArray(param)) {
    paramString = param[0];
  } else if (typeof param === "number") {
    paramString = param.toString();
  } else {
    paramString = param;
  }

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
