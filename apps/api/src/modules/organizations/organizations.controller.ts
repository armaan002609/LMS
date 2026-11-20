import {
  Controller,
  Get,
  Patch,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto, UpdateBrandingDto, CreateDomainDto } from './dto/organization.dto';
import { CurrentTenant } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@lms/db';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations/current')
@UseGuards(TenantGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization details' })
  async getCurrent(@CurrentTenant() orgId: string) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.orgService.getCurrent(orgId);
  }

  @Patch()
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update organization settings' })
  async updateCurrent(
    @CurrentTenant() orgId: string,
    @Body() dto: UpdateOrganizationDto
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.orgService.updateCurrent(orgId, dto);
  }

  @Get('branding')
  @ApiOperation({ summary: 'Get organization branding & design tokens' })
  async getBranding(@CurrentTenant() orgId: string) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.orgService.getBranding(orgId);
  }

  @Put('branding')
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update organization branding tokens (PRD §4.2, UI_UX_DESIGN §2.1)' })
  async updateBranding(
    @CurrentTenant() orgId: string,
    @Body() dto: UpdateBrandingDto
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.orgService.updateBranding(orgId, dto);
  }

  @Get('domains')
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List custom domains' })
  async getDomains(@CurrentTenant() orgId: string) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.orgService.getDomains(orgId);
  }

  @Post('domains')
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Register a new custom domain' })
  async createDomain(
    @CurrentTenant() orgId: string,
    @Body() dto: CreateDomainDto
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.orgService.createDomain(orgId, dto);
  }

  @Delete('domains/:domainId')
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete custom domain' })
  async deleteDomain(
    @CurrentTenant() orgId: string,
    @Param('domainId') domainId: string
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.orgService.deleteDomain(orgId, domainId);
  }
}
