import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Shape of a stored user.
 * The `password` field holds ONLY the bcrypt hash — never plaintext.
 */
interface User {
  id: number;
  email: string;
  password: string; // bcrypt hash
}

/**
 * Safe representation returned to callers — password is excluded.
 */
type SafeUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  /**
   * In-memory user store.
   * This replaces a real database for interview/demo purposes.
   * A real app would inject a TypeORM repository or Prisma client here.
   */
  private readonly users: User[] = [];
  private idCounter = 1;

  constructor(private readonly jwtService: JwtService) {}

  // ─── Signup ──────────────────────────────────────────────────────────────────

  /**
   * Creates a new user.
   *
   * Flow:
   *   1. Check that the email is not already taken.
   *   2. Hash the password with bcrypt (cost factor 10).
   *   3. Store the new user.
   *   4. Return the safe user (no password field).
   */
  async signup(dto: SignupDto): Promise<SafeUser> {
    // Prevent duplicate registrations
    const existing = this.users.find((u) => u.email === dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered.');
    }

    /**
     * bcrypt.hash(plaintext, saltRounds)
     * saltRounds = 10 is the industry standard for interactive logins.
     * Higher → slower hash (better security), lower → faster but weaker.
     * The salt is generated automatically and embedded in the hash output.
     */
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user: User = {
      id: this.idCounter++,
      email: dto.email,
      password: hashedPassword, // only ever store the hash
    };

    this.users.push(user);

    // Return the safe user — never expose the password hash
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

  /**
   * Validates credentials and returns a signed JWT.
   *
   * Flow:
   *   1. Find the user by email.
   *   2. Compare the provided password against the stored hash.
   *   3. Sign a JWT containing { sub, email } — no password in the payload.
   *   4. Return { accessToken }.
   */
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = this.users.find((u) => u.email === dto.email);

    /**
     * We intentionally give the same generic error for "user not found"
     * and "wrong password" to avoid leaking which emails are registered
     * (username enumeration attack).
     */
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    /**
     * JWT payload.
     * - sub (subject): the standard JWT claim for the user's unique ID.
     * - email: convenient to have in the token so /profile doesn't need a DB call.
     * - NEVER include the password hash or any sensitive data here.
     *   The payload is only base64-encoded, not encrypted — anyone can decode it.
     */
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  // ─── Validate User (called by JwtStrategy) ───────────────────────────────────

  /**
   * validateUser is called by JwtStrategy.validate() after Passport
   * has already verified the token's signature and expiry.
   *
   * In this implementation we return the payload directly because the
   * requirement is to demonstrate reading from the token — not from the DB.
   * A real app might look up the DB here to check if the user was deactivated.
   */
  validateUser(payload: { sub: number; email: string }): SafeUser {
    return { id: payload.sub, email: payload.email };
  }
}
