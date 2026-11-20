import { IsNotEmpty, IsOptional, IsString, IsArray, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'advanced-ai-agents' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lower-case alphanumeric separated by hyphens',
  })
  slug!: string;

  @ApiProperty({ example: 'Building Autonomous AI Agents' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Comprehensive guide to building production multi-agent systems' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ example: ['ai', 'typescript', 'agents'] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Building Autonomous AI Agents (Updated)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];
}
