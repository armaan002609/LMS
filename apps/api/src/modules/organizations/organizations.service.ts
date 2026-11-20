import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { UpdateOrganizationDto, UpdateBrandingDto, CreateDomainDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        branding: true,
        domains: true,
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization not found for id ${organizationId}`);
    }

    return org;
  }

  async updateCurrent(organizationId: string, dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: dto.name,
        defaultLocale: dto.defaultLocale,
        settings: dto.settings,
      },
    });
  }

  async getBranding(organizationId: string) {
    const branding = await this.prisma.orgBranding.findUnique({
      where: { organizationId },
    });

    return (
      branding || {
        organizationId,
        logoUrl: null,
        faviconUrl: null,
        tokens: {},
        terminology: {},
      }
    );
  }

  async updateBranding(organizationId: string, dto: UpdateBrandingDto) {
    return this.prisma.orgBranding.upsert({
      where: { organizationId },
      update: {
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        tokens: dto.tokens ?? {},
        terminology: dto.terminology ?? {},
      },
      create: {
        organizationId,
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        tokens: dto.tokens ?? {},
        terminology: dto.terminology ?? {},
      },
    });
  }

  async getDomains(organizationId: string) {
    return this.prisma.orgDomain.findMany({
      where: { organizationId },
    });
  }

  async createDomain(organizationId: string, dto: CreateDomainDto) {
    const existing = await this.prisma.orgDomain.findUnique({
      where: { domain: dto.domain.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Domain is already registered');
    }

    return this.prisma.orgDomain.create({
      data: {
        organizationId,
        domain: dto.domain.toLowerCase(),
        verificationToken: `lms-verify-${Math.random().toString(36).substring(2, 15)}`,
        tlsStatus: 'PENDING',
      },
    });
  }

  async deleteDomain(organizationId: string, domainId: string) {
    return this.prisma.orgDomain.deleteMany({
      where: {
        id: domainId,
        organizationId,
      },
    });
  }
}
