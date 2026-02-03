export const USERNAME_MAX_LENGTH = 25;

/**
 * Normalizes a username by:
 * 1. Replacing multiple consecutive spaces with a single space
 * 2. Optionally trimming and limiting length
 */
const normalizeUsername = (
  username: string,
  options: { trim?: boolean; limitLength?: boolean } = {
    trim: false,
    limitLength: false,
  },
): string => {
  let normalized = username.replace(/\s+/g, " ");

  if (options.trim) {
    normalized = normalized.trim();
  }

  if (options.limitLength && normalized.length > USERNAME_MAX_LENGTH) {
    normalized = normalized.slice(0, USERNAME_MAX_LENGTH);
  }

  return normalized;
};

/**
 * Validates a username according to business rules
 */
export const validateUsername = (
  username: string,
  options: { requireNonEmpty?: boolean; checkNormalizedLength?: boolean } = {
    requireNonEmpty: true,
    checkNormalizedLength: true,
  },
): { isValid: boolean; error?: string } => {
  const { requireNonEmpty = true, checkNormalizedLength = true } = options;

  if (requireNonEmpty && username.length === 0) {
    return { isValid: false, error: "Username is required" };
  }

  if (!requireNonEmpty && username.length === 0) {
    return { isValid: true };
  }

  // Regex inline ya que no se reutiliza
  if (!/^[a-zA-Z0-9\s\-_ñ]+$/.test(username)) {
    return {
      isValid: false,
      error:
        "Username can only contain letters, numbers, spaces, hyphens, and underscores",
    };
  }

  if (checkNormalizedLength) {
    const normalized = username.replace(/\s+/g, " ");
    if (normalized.length > USERNAME_MAX_LENGTH) {
      return {
        isValid: false,
        error: `Username cannot exceed ${USERNAME_MAX_LENGTH} characters`,
      };
    }
  }

  if (username.trim().length === 0) {
    return { isValid: false, error: "Username cannot consist only of spaces" };
  }

  return { isValid: true };
};

/**
 * Creates a handler for username input changes with visual normalization
 */
export const createUsernameChangeHandler = (
  setUsername: (value: string) => void,
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const normalized = value.replace(/\s+/g, " ");
    setUsername(normalized);
  };
};

/**
 * Gets a normalized username ready for submission
 */
export const getUsernameForSubmission = (
  username: string,
  options: { trim?: boolean; limitLength?: boolean } = {
    trim: true,
    limitLength: true,
  },
): string => {
  return normalizeUsername(username, options);
};
