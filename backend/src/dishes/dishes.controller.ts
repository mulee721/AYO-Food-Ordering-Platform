import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, Public } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('dishes')
@Controller('dishes')
export class DishesController {
  constructor(private service: DishesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all dishes with filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'restaurantId', required: false })
  @ApiQuery({ name: 'dietary', required: false })
  @ApiQuery({ name: 'popularOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false, enum: ['popular', 'rating', 'price-low', 'price-high', 'name'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get list of all dish categories' })
  getCategories() {
    return this.service.getCategories();
  }

  @Public()
  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all dishes for a specific restaurant' })
  findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.service.findByRestaurant(restaurantId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get dish by slug (e.g. d1)' })
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant_owner')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new dish' })
  create(@Body() dto: CreateDishDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant_owner')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a dish' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateDishDto>) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant_owner')
  @Patch(':id/availability')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle dish availability (in-stock / sold-out)' })
  toggleAvailability(@Param('id') id: string) {
    return this.service.toggleAvailability(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant_owner')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a dish' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
