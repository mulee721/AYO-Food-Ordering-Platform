import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Courier, CourierDocument } from '../schemas/courier.schema';

@Injectable()
export class CouriersService {
  constructor(@InjectModel(Courier.name) private courierModel: Model<CourierDocument>) {}

  async findAll(query: { isOnline?: boolean; zone?: string } = {}) {
    const filter: any = {};
    if (query.isOnline !== undefined) filter.isOnline = query.isOnline;
    if (query.zone) filter.zone = { $regex: query.zone, $options: 'i' };
    return this.courierModel.find(filter).lean();
  }

  async findByUserId(userId: string) {
    const c = await this.courierModel.findOne({ userId }).lean();
    if (!c) throw new NotFoundException('Courier profile not found');
    return c;
  }

  async findById(id: string) {
    const c = await this.courierModel.findById(id).lean();
    if (!c) throw new NotFoundException('Courier not found');
    return c;
  }

  async create(data: { userId: string; name: string; phone?: string; vehicle?: string; zone?: string; avatar?: string }) {
    return this.courierModel.create(data);
  }

  async toggleOnline(courierId: string) {
    const courier = await this.courierModel.findById(courierId);
    if (!courier) throw new NotFoundException('Courier not found');
    courier.isOnline = !courier.isOnline;
    await courier.save();
    return { isOnline: courier.isOnline };
  }

  async recordDelivery(courierId: string, earnings = 35) {
    const courier = await this.courierModel.findByIdAndUpdate(
      courierId,
      {
        $inc: {
          deliveriesToday: 1,
          earningsToday: earnings,
          totalDeliveries: 1,
          totalEarnings: earnings,
        },
        $unset: { currentOrderId: '' },
      },
      { new: true },
    ).lean();
    if (!courier) throw new NotFoundException('Courier not found');
    return courier;
  }

  async setActiveOrder(courierId: string, orderRef: string) {
    return this.courierModel.findByIdAndUpdate(
      courierId,
      { currentOrderId: orderRef },
      { new: true },
    ).lean();
  }

  async update(id: string, updates: Partial<{ name: string; phone: string; vehicle: string; zone: string; rating: number }>) {
    const c = await this.courierModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!c) throw new NotFoundException('Courier not found');
    return c;
  }

  async getStats() {
    const [total, online] = await Promise.all([
      this.courierModel.countDocuments(),
      this.courierModel.countDocuments({ isOnline: true }),
    ]);
    const earningsAgg = await this.courierModel.aggregate([
      { $group: { _id: null, totalEarnings: { $sum: '$totalEarnings' }, totalDeliveries: { $sum: '$totalDeliveries' } } },
    ]);
    return {
      total,
      online,
      offline: total - online,
      totalEarnings: earningsAgg[0]?.totalEarnings || 0,
      totalDeliveries: earningsAgg[0]?.totalDeliveries || 0,
    };
  }
}
