import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DishDocument = Dish & Document;

@Schema({ timestamps: true, versionKey: false })
export class Dish {
  @Prop({ required: true, unique: true })
  slug: string; // e.g. "d1"

  @Prop({ required: true })
  restaurantId: string; // restaurant slug

  @Prop({ required: true })
  restaurant: string; // display name

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, min: 0 })
  price: number; // ETB

  @Prop()
  originalPrice: number; // for discount display

  @Prop({ min: 1, max: 5, default: 5.0 })
  rating: number;

  @Prop({ default: 0 })
  reviews: number;

  @Prop()
  prepTime: string;

  @Prop()
  calories: string;

  @Prop({ type: [String], default: [] })
  dietary: string[]; // ['Vegetarian', 'Vegan', 'Fasting Friendly']

  @Prop()
  image: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ type: Object, default: {} })
  options: Record<string, string[]>; // { spiciness: ['Mild', 'Medium', 'Spicy'] }
}

export const DishSchema = SchemaFactory.createForClass(Dish);

DishSchema.index({ name: 'text', description: 'text', category: 'text' });
DishSchema.index({ restaurantId: 1 });
DishSchema.index({ category: 1 });
DishSchema.index({ isPopular: 1 });
DishSchema.index({ available: 1 });
