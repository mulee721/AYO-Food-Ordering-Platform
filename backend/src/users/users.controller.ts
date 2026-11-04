import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile' })
  getProfile(@Request() req) {
    return this.service.getProfile(req.user.userId);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile (name, phone, avatar)' })
  updateProfile(@Request() req, @Body() body: { name?: string; phone?: string; avatar?: string }) {
    return this.service.updateProfile(req.user.userId, body);
  }

  @Get('addresses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my saved delivery addresses' })
  getAddresses(@Request() req) {
    return this.service.getAddresses(req.user.userId);
  }

  @Post('addresses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new delivery address' })
  addAddress(@Request() req, @Body() body: { label: string; address: string; note?: string }) {
    return this.service.addAddress(req.user.userId, body);
  }

  @Delete('addresses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a saved address' })
  deleteAddress(@Request() req, @Param('id') id: string) {
    return this.service.deleteAddress(req.user.userId, id);
  }

  @Get('favorites')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my favourite dish IDs' })
  getFavorites(@Request() req) {
    return this.service.getFavorites(req.user.userId);
  }

  @Post('favorites/:dishId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle favourite status for a dish' })
  toggleFavorite(@Request() req, @Param('dishId') dishId: string) {
    return this.service.toggleFavorite(req.user.userId, dishId);
  }

  // Admin endpoints
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all platform users (admin only)' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend or activate a user (admin only)' })
  updateStatus(@Param('id') id: string, @Body('status') status: 'Active' | 'Suspended') {
    return this.service.updateUserStatus(id, status);
  }
}
