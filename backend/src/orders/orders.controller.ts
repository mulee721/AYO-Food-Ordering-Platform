import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, Public } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a new order' })
  create(@Body() dto: CreateOrderDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user order history' })
  getMyOrders(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.getMyOrders(req.user.userId, +page, +limit);
  }

  @Public()
  @Get('track/:ref')
  @ApiOperation({ summary: 'Track order by reference number (public)' })
  track(@Param('ref') ref: string) {
    return this.service.getTracking(ref);
  }

  @Public()
  @Get('ref/:ref')
  @ApiOperation({ summary: 'Get full order by reference number' })
  findByRef(@Param('ref') ref: string) {
    return this.service.findByRef(ref);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'restaurant_owner', 'delivery_agent')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (admin/restaurant/courier)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'restaurantId', required: false })
  @ApiQuery({ name: 'courierId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'restaurant_owner', 'delivery_agent')
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (with lifecycle validation)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Body('note') note: string,
    @Request() req,
  ) {
    return this.service.updateStatus(id, status, note, req.user?.role);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'delivery_agent')
  @Patch(':id/assign-courier')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a courier to an order' })
  assignCourier(
    @Param('id') id: string,
    @Body('courierId') courierId: string,
    @Body('courierName') courierName: string,
  ) {
    return this.service.assignCourier(id, courierId, courierName);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('stats/platform')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform-wide order and revenue statistics' })
  getPlatformStats() {
    return this.service.getPlatformStats();
  }
}
