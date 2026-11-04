import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

export type OrderStatus =
  | 'Pending Acceptance'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Courier Assigned'
  | 'Picked Up'
  | 'On the Way'
  | 'Delivered'
  | 'Cancelled';

@Schema({ timestamps: true, versionKey: false })
export class Order {
  @Prop({ required: true, unique: true })
  ref: string; // e.g. AYO-893041

  @Prop({ required: true })
  restaurantId: string;

  @Prop({ required: true })
  restaurant: string;

  @Prop({
    enum: [
      'Pending Acceptance',
      'Preparing',
      'Ready for Pickup',
      'Courier Assigned',
      'Picked Up',
      'On the Way',
      'Delivered',
      'Cancelled',
    ],
    default: 'Pending Acceptance',
  })
  status: OrderStatus;

  @Prop({ required: true })
  customerId: string; // User._id as string

  @Prop({
    type: {
      name: String,
      phone: String,
      email: String,
    },
    required: true,
  })
  customer: { name: string; phone: string; email: string };

  @Prop({
    type: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        selectedOptions: Object,
        image: String,
      },
    ],
    required: true,
  })
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedOptions: Record<string, string>;
    image: string;
  }>;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 35 })
  deliveryFee: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop()
  promoCode: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop()
  deliveryNotes: string;

  @Prop({ enum: ['delivery', 'pickup'], default: 'delivery' })
  deliveryMethod: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: 35 })
  estimatedDeliveryMinutes: number;

  @Prop()
  courierId: string;

  @Prop()
  courierName: string;

  @Prop({ type: [{ status: String, timestamp: Date, note: String }], default: [] })
  statusHistory: Array<{ status: string; timestamp: Date; note?: string }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// ref already has unique:true from @Prop — only add the non-duplicate indexes
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ restaurantId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ courierId: 1 });
OrderSchema.index({ createdAt: -1 });
