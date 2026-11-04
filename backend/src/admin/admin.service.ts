import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Restaurant, RestaurantDocument } from '../schemas/restaurant.schema';
import { Courier, CourierDocument } from '../schemas/courier.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Courier.name) private courierModel: Model<CourierDocument>,
  ) {}

  async getDashboardStats() {
    const [
      totalOrders, deliveredOrders, activeOrders,
      totalUsers, totalRestaurants, openRestaurants,
      totalCouriers, onlineCouriers,
      revenueAgg,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: 'Delivered' }),
      this.orderModel.countDocuments({ status: { $nin: ['Delivered', 'Cancelled'] } }),
      this.userModel.countDocuments(),
      this.restaurantModel.countDocuments(),
      this.restaurantModel.countDocuments({ status: 'Open' }),
      this.courierModel.countDocuments(),
      this.courierModel.countDocuments({ isOnline: true }),
      this.orderModel.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const grossRevenue = revenueAgg[0]?.total || 0;
    const commission = Math.round(grossRevenue * 0.15);

    return {
      orders: { total: totalOrders, delivered: deliveredOrders, active: activeOrders },
      revenue: { gross: grossRevenue, commission },
      users: { total: totalUsers },
      restaurants: { total: totalRestaurants, open: openRestaurants },
      couriers: { total: totalCouriers, online: onlineCouriers },
    };
  }
}
