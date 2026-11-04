import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promo, PromoDocument } from '../schemas/promo.schema';
import { Dish, DishDocument } from '../schemas/dish.schema';

const BASE_DELIVERY_FEE = 35;
const FREE_DELIVERY_THRESHOLD = 500;

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Promo.name) private promoModel: Model<PromoDocument>,
    @InjectModel(Dish.name) private dishModel: Model<DishDocument>,
  ) {}

  async validatePromo(code: string, subtotal: number) {
    const promo = await this.promoModel.findOne({ code: code.toUpperCase(), active: true }).lean();
    if (!promo) throw new NotFoundException(`Promo code "${code}" is not valid or has expired`);

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException('This promo code has reached its usage limit');
    }
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      throw new BadRequestException('This promo code has expired');
    }
    if (subtotal < promo.minOrder) {
      throw new BadRequestException(
        `Minimum order for code "${promo.code}" is ${promo.minOrder} ETB. Add ${promo.minOrder - subtotal} ETB more.`,
      );
    }

    let discount = 0;
    let message = '';
    if (promo.type === 'fixed') {
      discount = promo.value;
      message = `${promo.value} ETB discount applied!`;
    } else if (promo.type === 'percentage') {
      discount = Math.round(subtotal * promo.value / 100);
      message = `${promo.value}% discount (${discount} ETB) applied!`;
    } else if (promo.type === 'free_delivery') {
      discount = BASE_DELIVERY_FEE;
      message = 'Free delivery applied!';
    }

    return { valid: true, promo, discount, message };
  }

  async calculateTotals(items: Array<{ id: string; price: number; quantity: number }>, promoCode?: string) {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const qualifiesForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
    let deliveryFee = qualifiesForFreeDelivery ? 0 : BASE_DELIVERY_FEE;
    let discount = 0;
    let promoMessage = '';

    if (promoCode) {
      try {
        const result = await this.validatePromo(promoCode, subtotal);
        discount = result.discount;
        promoMessage = result.message;
        if (result.promo.type === 'free_delivery') deliveryFee = 0;
      } catch (e) {
        // Invalid promo — silently skip on calculate
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    const freeDeliveryProgress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

    return {
      subtotal,
      deliveryFee,
      discount,
      total,
      promoMessage,
      qualifiesForFreeDelivery,
      amountToFreeDelivery,
      freeDeliveryProgress,
    };
  }

  async getPromos() {
    return this.promoModel.find({ active: true }).lean();
  }

  async createPromo(dto: {
    code: string;
    type: string;
    value: number;
    minOrder?: number;
    description?: string;
    expiresAt?: Date;
    usageLimit?: number;
  }) {
    const exists = await this.promoModel.findOne({ code: dto.code.toUpperCase() });
    if (exists) throw new BadRequestException(`Promo code "${dto.code}" already exists`);
    return this.promoModel.create({ ...dto, code: dto.code.toUpperCase() });
  }

  async updatePromo(id: string, updates: Partial<{ active: boolean; value: number; minOrder: number }>) {
    return this.promoModel.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  async deletePromo(id: string) {
    await this.promoModel.findByIdAndDelete(id);
    return { message: 'Promo deleted' };
  }
}
