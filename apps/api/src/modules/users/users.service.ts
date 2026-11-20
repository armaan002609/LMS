import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { InviteUserDto, CreateGroupDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(organizationId: string) {
    return this.prisma.membership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            locale: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async inviteUser(organizationId: string, dto: InviteUserDto) {
    const user = await this.prisma.user.upsert({
      where: { email: dto.email.toLowerCase() },
      update: { name: dto.name },
      create: {
        email: dto.email.toLowerCase(),
        name: dto.name,
      },
    });

    return this.prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
      update: { role: dto.role },
      create: {
        organizationId,
        userId: user.id,
        role: dto.role,
      },
    });
  }

  async getUser(organizationId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      include: { user: true },
    });

    if (!membership) {
      throw new NotFoundException(`User ${userId} not found in this organization`);
    }

    return membership;
  }

  async listGroups(organizationId: string) {
    return this.prisma.group.findMany({
      where: { organizationId },
      include: { _count: { select: { members: true } } },
    });
  }

  async createGroup(organizationId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
      },
    });
  }
}
