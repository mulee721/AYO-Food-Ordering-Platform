import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromoDocument = Promo & Document;

@Schema({ timestamps: true, versionKey: false })
export class Promo {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ enum: ['fixed', 'percentage', 'free_delivery'], required: true })
  type: string;

  @Prop({ required: true })
  value: number; // ETB amount or percentage

  @Prop({ default: 0 })
  minOrder: number;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  description: string;

  @Prop()
  expiresAt: Date;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop()
  usageLimit: number;
}

export const PromoSchema = SchemaFactory.createForClass(Promo);
