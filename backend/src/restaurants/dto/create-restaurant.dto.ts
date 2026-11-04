import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'selam-kitchen' })
  @IsString() @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Selam Kitchen' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Ethiopian Cuisine' })
  @IsString() @IsNotEmpty()
  cuisine: string;

  @ApiPropertyOptional({ example: 'Bole Medhanealem, Atlas Rd, Addis Ababa' })
  @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+251 911 234 567' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional() @IsNumber()
  fee?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional() @IsNumber()
  time?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional() @IsNumber()
  minOrder?: number;

  @ApiPropertyOptional({ enum: ['$', '$$', '$$$'] })
  @IsOptional() @IsEnum(['$', '$$', '$$$'])
  priceLevel?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  featured?: boolean;
}
