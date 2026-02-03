import { check, ValidationChain } from "express-validator";

const normalizeUsername = (username: string): string => {
  return username.replace(/\s+/g, " ").trim();
};

const validatorRegistration: ValidationChain[] = [
  check("user")
    .notEmpty()
    .withMessage("Username cannot be empty")
    .isLength({ min: 1 })
    .withMessage("Username should have at least 1 character")
    .isLength({ max: 25 })
    .withMessage("Username cannot exceed 25 characters")
    .custom((value) => {
      const normalized = normalizeUsername(value);
      if (normalized.length === 0) {
        throw new Error("Username cannot consist only of spaces");
      }

      if (normalized.length > 25) {
        throw new Error(
          "Username cannot exceed 25 characters after normalization",
        );
      }

      return true;
    })
    .customSanitizer((value) => {
      return normalizeUsername(value);
    }),
  check("password")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isLength({ min: 5 })
    .withMessage("Password should be at least 5 characters long"),
  check("email")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .matches(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Email is invalid"),
];

export default validatorRegistration;
