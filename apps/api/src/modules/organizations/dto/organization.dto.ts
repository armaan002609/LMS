import { IsString, IsOptional, IsObject, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme International University' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  defaultLocale?: string;

  @ApiPropertyOptional({ example: { gamification: { enabled: true } } })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateBrandingDto {
  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/favicon.ico' })
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional({
    example: {
      '--color-primary': '#4F46E5',
      '--color-primary-contrast': '#FFFFFF',
      '--color-secondary': '#0EA5E9',
      '--radius-md': '8px',
    },
  })
  @IsOptional()
  @IsObject()
  tokens?: Record<string, string>;

  @ApiPropertyOptional({
    example: {
      course: 'Course',
      lesson: 'Lesson',
      learner: 'Student',
    },
  })
  @IsOptional()
  @IsObject()
  terminology?: Record<string, string>;
}

export class CreateDomainDto {
  @ApiProperty({ example: 'learn.acme.edu' })
  @IsString()
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, {
    message: 'Must be a valid fully-qualified domain name',
  })
  domain!: string;
}
