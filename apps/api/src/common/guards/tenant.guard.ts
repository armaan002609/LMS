import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Resolve organization_id from header (x-organization-id) or domain host
    let organizationId = request.headers['x-organization-id'];

    if (!organizationId) {
      const host = request.headers['x-forwarded-host'] || request.headers.host || '';
      const domain = host.split(':')[0];

      // Lookup organization by subdomain or custom domain
      if (domain.endsWith('.lmsportal.app')) {
        const slug = domain.replace('.lmsportal.app', '');
        const org = await this.prisma.organization.findUnique({
          where: { slug },
          select: { id: true },
        });
        if (org) {
          organizationId = org.id;
        }
      } else {
        const customDomain = await this.prisma.orgDomain.findUnique({
          where: { domain },
          select: { organizationId: true },
        });
        if (customDomain) {
          organizationId = customDomain.organizationId;
        }
      }
    }

    // Attach resolved organizationId to request
    request.organizationId = organizationId;

    // If endpoint has authenticated user, ensure they belong to this organization
    if (request.user && organizationId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: request.user.id,
          },
        },
      });

      if (!membership && request.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('User is not a member of this organization');
      }

      if (membership) {
        request.userRole = membership.role;
      }
    }

    return true;
  }
}
