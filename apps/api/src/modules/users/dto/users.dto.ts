import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@lms/db';

export class InviteUserDto {
  @ApiProperty({ example: 'colleague@acme.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: Role, default: Role.LEARNER })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({ example: 'Jane Smith' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateGroupDto {
  @ApiProperty({ example: 'Fall 2026 Cohort' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Undergraduate engineering cohort' })
  @IsOptional()
  @IsString()
  description?: string;
}
