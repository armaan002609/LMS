import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { PrismaService } from './common/database/prisma.service';

@Module({
  imports: [
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
