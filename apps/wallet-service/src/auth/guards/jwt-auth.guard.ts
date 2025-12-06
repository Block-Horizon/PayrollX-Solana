import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * JWT Authentication Guard
 *
 * Extends Passport's AuthGuard to use the 'jwt' strategy.
 * This guard will:
 * 1. Extract JWT from Authorization header
 * 2. Validate JWT signature and expiration
 * 3. Call JwtStrategy.validate() with decoded payload
 * 4. Attach user object to req.user if valid
 * 5. Throw UnauthorizedException if invalid or missing
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Controller('wallets')
 * export class WalletController {
 *   @Get()
 *   getWallets(@Request() req) {
 *     // req.user contains the validated user object
 *   }
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

