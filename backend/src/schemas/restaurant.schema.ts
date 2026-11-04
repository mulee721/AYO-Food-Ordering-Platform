import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true, versionKey: false })
export class Restaurant {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string; // e.g. "selam-kitchen"

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  cuisine: string;

  @Prop({ min: 1, max: 5, default: 5.0 })
  rating: number;

  @Prop({ default: 0 })
  reviewsCount: number;

  @Prop({ default: 30 })
  time: number; // delivery minutes

  @Prop({ default: 35 })
  fee: number; // ETB

  @Prop({ default: 150 })
  minOrder: number; // ETB

  @Prop({ enum: ['Open', 'Closed'], default: 'Open' })
  status: string;

  @Prop({ enum: ['$', '$$', '$$$'], default: '$$' })
  priceLevel: string;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ trim: true })
  address: string;

  @Prop()
  phone: string;

  @Prop()
  image: string;

  @Prop()
  coverImage: string;

  @Prop()
  description: string;

  @Prop({ enum: ['active', 'pending', 'suspended'], default: 'active' })
  approvalStatus: string;

  @Prop()
  ownerId: string; // references User._id
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// Text index for search
RestaurantSchema.index({ name: 'text', cuisine: 'text', address: 'text' });
// slug already has unique:true from @Prop — skip the duplicate { slug: 1 } index
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ featured: 1 });
RestaurantSchema.index({ status: 1 });
