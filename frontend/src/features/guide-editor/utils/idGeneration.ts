/**
 * Generates a unique ID with optional prefix
 * 
 * Format: `${prefix}-${timestamp}-${randomString}`
 * Example: "pair-1714234567890-a3k9xz"
 * 
 * @param prefix - Optional prefix for the ID (e.g., "pair", "hand", "step")
 * @returns A unique ID string
 */
export const generateUniqueId = (prefix?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).slice(2, 8);
  
  if (prefix) {
    return `${prefix}-${timestamp}-${randomString}`;
  }
  
  return `${timestamp}-${randomString}`;
};
