import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * JWT Strategy for Wallet Service
 *
 * Implements Passport's JWT strategy for token-based authentication.
 * Extracts JWT token from Authorization header and validates it.
 *
 * This strategy:
 * 1. Extracts JWT from 'Bearer <token>' in Authorization header
 * 2. Validates token signature and expiration
 * 3. Calls validate() with decoded payload
 * 4. Returns user context for use in controllers/guards
 *
 * @class JwtStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Don't ignore expiration - tokens must be valid
      ignoreExpiration: false,
      // Secret key for verifying token signature
      secretOrKey: configService.get<string>("JWT_SECRET") || "your-secret-key",
    });
  }

  /**
   * Validates JWT payload.
   *
   * Called automatically by Passport after JWT is verified.
   * The payload is the decoded JWT token.
   *
   * @param payload - Decoded JWT payload (from login token)
   * @returns User context object (attached to req.user when using JwtAuthGuard)
   */
  async validate(payload: {
    email: string;
    sub: string;
    role: string;
    organizationId?: string | null;
  }): Promise<{
    id: string;
    userId?: string;
    email: string;
    role: string;
    organizationId?: string | null;
  }> {
    this.logger.debug(`Validating JWT payload for user: ${payload.sub}`);

    // Return user context from JWT payload
    // This will be attached to req.user when using JwtAuthGuard
    // Include both id and userId for compatibility
    return {
      id: payload.sub, // User ID from JWT
      userId: payload.sub, // Also include userId for compatibility
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId || null,
    };
  }
}

