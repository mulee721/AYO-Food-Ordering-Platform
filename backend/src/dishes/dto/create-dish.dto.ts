import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDishDto {
  @ApiProperty({ example: 'd1' })
  @IsString() @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'selam-kitchen' })
  @IsString() @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ example: 'Selam Kitchen' })
  @IsString() @IsNotEmpty()
  restaurant: string;

  @ApiProperty({ example: 'Royal Beyaynetu Platter' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Ethiopian Cuisine' })
  @IsString() @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 320 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 360 })
  @IsOptional() @IsNumber()
  originalPrice?: number;

  @ApiPropertyOptional({ example: '20 min' })
  @IsOptional() @IsString()
  prepTime?: string;

  @ApiPropertyOptional({ example: '650 kcal' })
  @IsOptional() @IsString()
  calories?: string;

  @ApiPropertyOptional({ example: ['Vegetarian', 'Vegan'] })
  @IsOptional() @IsArray()
  dietary?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({ example: { spiciness: ['Mild', 'Medium', 'Spicy'] } })
  @IsOptional() @IsObject()
  options?: Record<string, string[]>;
}
