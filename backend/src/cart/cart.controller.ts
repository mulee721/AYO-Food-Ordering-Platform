import { Controller, Post, Get, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, Public } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private service: CartService) {}

  @Public()
  @Post('calculate')
  @ApiOperation({ summary: 'Calculate totals for a cart (subtotal, delivery, discount, total)' })
  calculate(
    @Body() body: { items: Array<{ id: string; price: number; quantity: number }>; promoCode?: string },
  ) {
    return this.service.calculateTotals(body.items, body.promoCode);
  }

  @Public()
  @Post('validate-promo')
  @ApiOperation({ summary: 'Validate a promo code against a subtotal' })
  validatePromo(@Body() body: { code: string; subtotal: number }) {
    return this.service.validatePromo(body.code, body.subtotal);
  }

  @Public()
  @Get('promos')
  @ApiOperation({ summary: 'Get all active promo codes (public)' })
  getPromos() {
    return this.service.getPromos();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('promos')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promo code (admin only)' })
  createPromo(@Body() body: any) {
    return this.service.createPromo(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('promos/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a promo code (admin only)' })
  updatePromo(@Param('id') id: string, @Body() body: any) {
    return this.service.updatePromo(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('promos/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promo code (admin only)' })
  deletePromo(@Param('id') id: string) {
    return this.service.deletePromo(id);
  }
}
