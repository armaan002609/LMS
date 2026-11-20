import { IsNotEmpty, IsOptional, IsString, IsNumber, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 'b8e96bf0-3cb8-4fbb-9da4-c4819e990b79' })
  @IsNotEmpty()
  @IsString()
  courseId!: string;

  @ApiPropertyOptional({ example: '7d6bf43a-23d5-455b-b9f1-435fa188a18a' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'WELCOME25' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class UpdateProgressDto {
  @ApiProperty({ example: 'COMPLETED' })
  @IsNotEmpty()
  @IsString()
  status!: string;

  @ApiPropertyOptional({ example: 85.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  timeSpentSec?: number;

  @ApiPropertyOptional({ example: { videoPosition: 128 } })
  @IsOptional()
  @IsObject()
  state?: Record<string, any>;
}
