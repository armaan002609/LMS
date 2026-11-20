import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/database/prisma.service';
import { RegisterDto, LoginDto, RefreshDto, MfaVerifyDto } from './dto/auth.dto';
import { Role } from '@lms/db';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto, organizationId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
      },
    });

    // If tenant context exists, auto-create membership as LEARNER
    if (organizationId) {
      await this.prisma.membership.create({
        data: {
          organizationId,
          userId: user.id,
          role: Role.LEARNER,
        },
      });
    }

    return this.generateTokens(user.id, user.email, organizationId, Role.LEARNER);
  }

  async login(dto: LoginDto, organizationId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    let role: Role = Role.LEARNER;

    if (organizationId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: user.id,
          },
        },
      });

      if (!membership) {
        throw new UnauthorizedException('You do not have access to this organization');
      }

      role = membership.role;
    }

    return this.generateTokens(user.id, user.email, organizationId, role);
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
      });

      return this.generateTokens(payload.sub, payload.email, payload.organizationId, payload.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyMfa(_userId: string, dto: MfaVerifyDto) {
    // TOTP verification skeleton (RFC 6238)
    if (dto.code === '123456') {
      return { success: true };
    }
    throw new UnauthorizedException('Invalid MFA verification code');
  }

  private generateTokens(userId: string, email: string, organizationId?: string, role?: Role) {
    const payload = { sub: userId, email, organizationId, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev_jwt_secret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }
}
