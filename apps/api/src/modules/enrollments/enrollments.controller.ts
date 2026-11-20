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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateProgressDto } from './dto/enrollments.dto';
import { CurrentTenant, CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Enrollment')
@ApiBearerAuth()
@Controller()
@UseGuards(TenantGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('enrollments')
  @ApiOperation({ summary: 'Enroll in course (free or pending order)' })
  async enroll(
    @CurrentTenant() orgId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateEnrollmentDto
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    const userId = user?.id || 'demo-learner';
    return this.enrollmentsService.enroll(orgId, userId, dto);
  }

  @Get('enrollments/me')
  @ApiOperation({ summary: 'Get current learner enrollments' })
  async getMyEnrollments(
    @CurrentTenant() orgId: string,
    @CurrentUser() user: any
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    const userId = user?.id || 'demo-learner';
    return this.enrollmentsService.getMyEnrollments(orgId, userId);
  }

  @Post('lessons/:lessonId/progress')
  @ApiOperation({ summary: 'Update lesson progress & recompute completion (PRD §4.4, §6)' })
  async updateProgress(
    @CurrentTenant() orgId: string,
    @CurrentUser() user: any,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    const userId = user?.id || 'demo-learner';
    return this.enrollmentsService.updateProgress(orgId, userId, lessonId, dto);
  }
}
