import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { InviteUserDto, CreateGroupDto } from './dto/users.dto';
import { CurrentTenant } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@lms/db';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(TenantGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List organization users and memberships' })
  async listUsers(@CurrentTenant() orgId: string) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.usersService.listUsers(orgId);
  }

  @Post()
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Invite or add user to organization' })
  async inviteUser(@CurrentTenant() orgId: string, @Body() dto: InviteUserDto) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.usersService.inviteUser(orgId, dto);
  }

  @Get(':userId')
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user profile in organization' })
  async getUser(@CurrentTenant() orgId: string, @Param('userId') userId: string) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.usersService.getUser(orgId, userId);
  }
}

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
@UseGuards(TenantGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'List groups in organization' })
  async listGroups(@CurrentTenant() orgId: string) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.usersService.listGroups(orgId);
  }

  @Post()
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new group/cohort' })
  async createGroup(@CurrentTenant() orgId: string, @Body() dto: CreateGroupDto) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.usersService.createGroup(orgId, dto);
  }
}
