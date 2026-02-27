/**
 * Formats a number to a compact string representation
 * Examples: 1234 -> "1.2k", 1234567 -> "1.2M"
 */
export const formatCompactNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};
