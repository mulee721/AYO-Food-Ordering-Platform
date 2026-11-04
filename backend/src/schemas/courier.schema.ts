import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourierDocument = Courier & Document;

@Schema({ timestamps: true, versionKey: false })
export class Courier {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  vehicle: string;

  @Prop({ min: 1, max: 5, default: 5.0 })
  rating: number;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop()
  zone: string;

  @Prop({ default: 0 })
  deliveriesToday: number;

  @Prop({ default: 0 })
  earningsToday: number;

  @Prop({ default: 0 })
  totalDeliveries: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop()
  avatar: string;

  @Prop()
  currentOrderId: string; // active order ref
}

export const CourierSchema = SchemaFactory.createForClass(Courier);
