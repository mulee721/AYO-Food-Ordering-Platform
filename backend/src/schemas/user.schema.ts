import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export type UserRole = 'customer' | 'restaurant_owner' | 'delivery_agent' | 'admin';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ enum: ['customer', 'restaurant_owner', 'delivery_agent', 'admin'], default: 'customer' })
  role: UserRole;

  @Prop({ enum: ['Active', 'Suspended', 'Pending'], default: 'Active' })
  status: string;

  @Prop()
  avatar: string;

  @Prop()
  restaurantId: string; // only for restaurant_owner

  @Prop({ type: [String], default: [] })
  favorites: string[]; // dish IDs

  @Prop({
    type: [
      {
        id: String,
        label: String,
        address: String,
        note: String,
      },
    ],
    default: [],
  })
  addresses: Array<{ id: string; label: string; address: string; note: string }>;

  // ── Password reset OTP ──
  @Prop()
  resetOtp: string;          // hashed 6-digit code

  @Prop()
  resetOtpExpiry: Date;      // expires 10 minutes after issue
}

export const UserSchema = SchemaFactory.createForClass(User);
