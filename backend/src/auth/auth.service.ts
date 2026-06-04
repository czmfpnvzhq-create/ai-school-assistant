import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

/** Lower rounds = faster login compare; 8 is fine for demo/school apps */
const BCRYPT_ROUNDS = 8;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(body: any) {
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      throw new BadRequestException('Missing required fields');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(tokenPayload, { expiresIn: '7d' });

    return {
      token,
      user: tokenPayload,
    };
  }

  async login(body: any) {
    const started = Date.now();
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestException('Missing email or password');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    const dbMs = Date.now() - started;

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const compareStart = Date.now();
    const isPasswordValid = await bcrypt.compare(password, user.password);
    const bcryptMs = Date.now() - compareStart;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(tokenPayload, { expiresIn: '7d' });
    const totalMs = Date.now() - started;

    if (totalMs > 300) {
      this.logger.warn(
        `Login slow: ${totalMs}ms total (db ${dbMs}ms, bcrypt ${bcryptMs}ms) for ${email}`,
      );
    } else {
      this.logger.debug(
        `Login: ${totalMs}ms (db ${dbMs}ms, bcrypt ${bcryptMs}ms)`,
      );
    }

    return {
      token,
      user: tokenPayload,
    };
  }
}
