import { Module } from '@nestjs/common';
import { UsersController, GroupsController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/database/prisma.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [UsersController, GroupsController],
  providers: [UsersService, PrismaService, TenantGuard, RolesGuard],
  exports: [UsersService],
})
export class UsersModule {}
