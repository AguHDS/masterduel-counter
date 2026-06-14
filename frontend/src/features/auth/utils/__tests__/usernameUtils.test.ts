import { describe, it, expect, vi } from "vitest";
import {
  validateUsername,
  getUsernameForSubmission,
  createUsernameChangeHandler,
  USERNAME_MAX_LENGTH,
} from "../usernameUtils";

describe("validateUsername", () => {
  it("should return error for empty username", () => {
    const result = validateUsername("");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Username is required");
  });

  it("should return valid for a normal username", () => {
    const result = validateUsername("Mathmech");

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should return error for spaces-only username", () => {
    const result = validateUsername("   ");

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/cannot consist only of spaces/i);
  });

  it(`should return error for username over ${USERNAME_MAX_LENGTH} characters`, () => {
    const longName = "a".repeat(USERNAME_MAX_LENGTH + 1);

    const result = validateUsername(longName);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/cannot exceed/i);
  });

  it("should allow empty when requireNonEmpty is false", () => {
    const result = validateUsername("", { requireNonEmpty: false });

    expect(result.isValid).toBe(true);
  });

  it("should skip length check when checkNormalizedLength is false", () => {
    const longName = "a".repeat(USERNAME_MAX_LENGTH + 1);

    const result = validateUsername(longName, { checkNormalizedLength: false });

    expect(result.isValid).toBe(true);
  });
});

describe("getUsernameForSubmission", () => {
  it("should trim whitespace", () => {
    const result = getUsernameForSubmission("  Mathmech  ");

    expect(result).toBe("Mathmech");
  });

  it("should collapse multiple spaces into one", () => {
    const result = getUsernameForSubmission("Math  mech");

    expect(result).toBe("Math mech");
  });

  it("should limit to max length", () => {
    const longName = "a".repeat(USERNAME_MAX_LENGTH + 5);
    const result = getUsernameForSubmission(longName);

    expect(result.length).toBe(USERNAME_MAX_LENGTH);
  });
});

describe("createUsernameChangeHandler", () => {
  it("should normalize spaces and call setUsername", () => {
    const setUsername = vi.fn();
    const handler = createUsernameChangeHandler(setUsername);

    handler({
      target: { value: "Math   mech" },
    } as React.ChangeEvent<HTMLInputElement>);

    expect(setUsername).toHaveBeenCalledWith("Math mech");
  });

  it("should replace multiple consecutive spaces with single space", () => {
    const setUsername = vi.fn();
    const handler = createUsernameChangeHandler(setUsername);

    handler({
      target: { value: "   a   b   c   " },
    } as React.ChangeEvent<HTMLInputElement>);

    expect(setUsername).toHaveBeenCalledWith(" a b c ");
  });
});
