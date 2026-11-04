import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouriersService } from './couriers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, Public } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('couriers')
@Controller('couriers')
@UseGuards(JwtAuthGuard)
export class CouriersController {
  constructor(private service: CouriersService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all couriers (admin)' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courier fleet statistics (admin)' })
  getStats() {
    return this.service.getStats();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my courier profile' })
  getMyProfile(@Request() req) {
    return this.service.findByUserId(req.user.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courier by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new courier profile (admin)' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id/toggle-online')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle courier online/offline duty status' })
  toggleOnline(@Param('id') id: string) {
    return this.service.toggleOnline(id);
  }

  @Patch(':id/record-delivery')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a completed delivery and add earnings' })
  recordDelivery(@Param('id') id: string, @Body('earnings') earnings: number) {
    return this.service.recordDelivery(id, earnings);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update courier profile details' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
