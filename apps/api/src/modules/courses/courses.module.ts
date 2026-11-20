import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../common/database/prisma.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaService, TenantGuard, RolesGuard],
  exports: [CoursesService],
})
export class CoursesModule {}
