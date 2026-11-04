import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsNumber() price: number;
  @ApiProperty() @IsNumber() quantity: number;
  @ApiPropertyOptional() selectedOptions?: Record<string, string>;
  @ApiPropertyOptional() image?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'selam-kitchen' })
  @IsString() @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ example: 'Selam Kitchen' })
  @IsString() @IsNotEmpty()
  restaurant: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'Bole Atlas, House #402, Addis Ababa' })
  @IsString() @IsNotEmpty()
  deliveryAddress: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({ enum: ['delivery', 'pickup'], default: 'delivery' })
  @IsOptional() @IsEnum(['delivery', 'pickup'])
  deliveryMethod?: string;

  @ApiProperty({ example: 'Cash on Delivery' })
  @IsString() @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'AYO50' })
  @IsOptional() @IsString()
  promoCode?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  deliveryFee?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  discount?: number;
}
