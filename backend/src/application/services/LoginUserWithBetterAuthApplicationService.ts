import { auth } from "@/lib/auth.js";
import { SqliteUserRepository } from "@/infrastructure/repositories/SqliteUserRepository.js";

interface LoginResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  headers?: Headers;
}

export class LoginUserWithBetterAuthApplicationService {
  constructor(private readonly userRepository: SqliteUserRepository) {}

  async execute(
    username: string,
    password: string,
    requestHeaders: Headers,
  ): Promise<LoginResult> {
    // Find user by username to get their email
    const user = await this.userRepository.findUserByUsername(username);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Use BetterAuth to sign in with email, passing headers for cookie management
    const response = await auth.api.signInEmail({
      body: {
        email: user.email,
        password,
      },
      headers: requestHeaders,
      asResponse: true,
    });

    // Parse the response body
    const result = await response.json();

    if (!result || !result.user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: user.role,
      },
      headers: response.headers,
    };
  }
}
