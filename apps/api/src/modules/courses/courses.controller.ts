import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/courses.dto';
import { CurrentTenant, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role, CourseStatus } from '@lms/db';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
@UseGuards(TenantGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List courses in current organization' })
  @ApiQuery({ name: 'status', enum: CourseStatus, required: false })
  async listCourses(
    @CurrentTenant() orgId: string,
    @Query('status') status?: CourseStatus
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.coursesService.listCourses(orgId, status);
  }

  @Get(':courseId')
  @ApiOperation({ summary: 'Get course details with sections and lessons' })
  async getCourse(
    @CurrentTenant() orgId: string,
    @Param('courseId') courseId: string
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.coursesService.getCourse(orgId, courseId);
  }

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new course (draft)' })
  async createCourse(
    @CurrentTenant() orgId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCourseDto
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    const ownerId = user?.id || 'system-owner';
    return this.coursesService.createCourse(orgId, ownerId, dto);
  }

  @Patch(':courseId')
  @Roles(Role.INSTRUCTOR, Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update course metadata' })
  async updateCourse(
    @CurrentTenant() orgId: string,
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCourseDto
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.coursesService.updateCourse(orgId, courseId, dto);
  }

  @Post(':courseId/publish')
  @Roles(Role.INSTRUCTOR, Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Publish course and freeze current version (PRD §4.4, BRAIN §7.2)' })
  async publishCourse(
    @CurrentTenant() orgId: string,
    @Param('courseId') courseId: string
  ) {
    if (!orgId) throw new BadRequestException('Organization context required');
    return this.coursesService.publishCourse(orgId, courseId);
  }
}
