import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../schemas/order.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Promo, PromoDocument } from '../schemas/promo.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Promo.name) private promoModel: Model<PromoDocument>,
  ) {}

  private generateRef(): string {
    return `AYO-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  async create(dto: CreateOrderDto, userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    // Calculate totals
    const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = dto.deliveryFee ?? (dto.deliveryMethod === 'pickup' ? 0 : 35);
    let discount = dto.discount || 0;

    // Validate and apply promo code
    if (dto.promoCode) {
      const promo = await this.promoModel.findOne({ code: dto.promoCode.toUpperCase(), active: true });
      if (promo) {
        if (subtotal < promo.minOrder) {
          throw new BadRequestException(`Minimum order for code ${promo.code} is ${promo.minOrder} ETB`);
        }
        if (promo.type === 'fixed') discount = promo.value;
        else if (promo.type === 'percentage') discount = Math.round(subtotal * promo.value / 100);
        else if (promo.type === 'free_delivery') discount = deliveryFee;
        promo.usageCount = (promo.usageCount || 0) + 1;
        await promo.save();
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);

    // Ensure unique ref
    let ref = this.generateRef();
    while (await this.orderModel.exists({ ref })) {
      ref = this.generateRef();
    }

    const order = await this.orderModel.create({
      ref,
      restaurantId: dto.restaurantId,
      restaurant: dto.restaurant,
      status: 'Pending Acceptance',
      customerId: userId,
      customer: { name: user.name, phone: user.phone || '', email: user.email },
      items: dto.items,
      subtotal,
      deliveryFee,
      discount,
      promoCode: dto.promoCode || null,
      total,
      deliveryAddress: dto.deliveryAddress,
      deliveryNotes: dto.deliveryNotes || '',
      deliveryMethod: dto.deliveryMethod || 'delivery',
      paymentMethod: dto.paymentMethod,
      estimatedDeliveryMinutes: 35,
      statusHistory: [{ status: 'Pending Acceptance', timestamp: new Date() }],
    });

    return order;
  }

  async findAll(query: {
    status?: string;
    restaurantId?: string;
    customerId?: string;
    courierId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, restaurantId, customerId, courierId, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (restaurantId) filter.restaurantId = restaurantId;
    if (customerId) filter.customerId = customerId;
    if (courierId) filter.courierId = courierId;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments(filter),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findByRef(ref: string) {
    const order = await this.orderModel.findOne({ ref }).lean();
    if (!order) throw new NotFoundException(`Order ${ref} not found`);
    return order;
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id).lean();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getMyOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel.find({ customerId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments({ customerId: userId }),
    ]);
    return { data, total, page, limit };
  }

  async updateStatus(id: string, status: OrderStatus, note?: string, actorRole?: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const validTransitions: Record<string, string[]> = {
      'Pending Acceptance': ['Preparing', 'Cancelled'],
      'Preparing': ['Ready for Pickup', 'Cancelled'],
      'Ready for Pickup': ['Courier Assigned', 'Cancelled'],
      'Courier Assigned': ['Picked Up', 'Cancelled'],
      'Picked Up': ['On the Way'],
      'On the Way': ['Delivered'],
      'Delivered': [],
      'Cancelled': [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from "${order.status}" to "${status}"`,
      );
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });
    await order.save();
    return order;
  }

  async assignCourier(orderId: string, courierId: string, courierName: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    order.courierId = courierId;
    order.courierName = courierName;
    order.status = 'Courier Assigned';
    order.statusHistory.push({ status: 'Courier Assigned', timestamp: new Date(), note: `Courier: ${courierName}` });
    await order.save();
    return order;
  }

  async getTracking(ref: string) {
    const order = await this.orderModel.findOne({ ref }).select('ref status statusHistory estimatedDeliveryMinutes restaurant restaurantId courierId courierName customer deliveryAddress').lean();
    if (!order) throw new NotFoundException(`Order ${ref} not found`);

    const statusSteps = [
      'Pending Acceptance', 'Preparing', 'Ready for Pickup',
      'Courier Assigned', 'Picked Up', 'On the Way', 'Delivered',
    ];
    const currentIdx = statusSteps.indexOf(order.status);

    return {
      ...order,
      progress: order.status === 'Cancelled' ? 0 : Math.round(((currentIdx + 1) / statusSteps.length) * 100),
      currentStep: currentIdx,
      totalSteps: statusSteps.length,
      steps: statusSteps.map((step, i) => ({
        label: step,
        completed: i <= currentIdx && order.status !== 'Cancelled',
        active: i === currentIdx,
        timestamp: order.statusHistory?.find(h => h.status === step)?.timestamp || null,
      })),
    };
  }

  async getPlatformStats() {
    const [total, delivered, active, cancelled] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: 'Delivered' }),
      this.orderModel.countDocuments({ status: { $nin: ['Delivered', 'Cancelled'] } }),
      this.orderModel.countDocuments({ status: 'Cancelled' }),
    ]);

    const revenueAgg = await this.orderModel.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    return {
      total,
      delivered,
      active,
      cancelled,
      revenue,
      commission: Math.round(revenue * 0.15),
    };
  }
}
