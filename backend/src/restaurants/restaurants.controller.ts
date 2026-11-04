import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, Public } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private service: RestaurantsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all restaurants with optional filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'cuisine', required: false })
  @ApiQuery({ name: 'priceLevel', required: false, enum: ['$', '$$', '$$$'] })
  @ApiQuery({ name: 'status', required: false, enum: ['Open', 'Closed'] })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false, enum: ['rating', 'reviews', 'time', 'fee', 'name'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Get platform restaurant stats' })
  getStats() {
    return this.service.getStats();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get restaurant by slug (e.g. selam-kitchen)' })
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant_owner')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new restaurant' })
  create(@Body() dto: CreateRestaurantDto, @Request() req) {
    return this.service.create(dto, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant_owner')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant details' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRestaurantDto>) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant_owner')
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle restaurant open/closed status' })
  updateStatus(@Param('id') id: string, @Body('status') status: 'Open' | 'Closed') {
    return this.service.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a restaurant (admin only)' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
