import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, updates: { name?: string; phone?: string; avatar?: string }) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updates, { new: true })
      .select('-password')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ---- Addresses ----
  async getAddresses(userId: string) {
    const user = await this.userModel.findById(userId).select('addresses').lean();
    if (!user) throw new NotFoundException('User not found');
    return user.addresses || [];
  }

  async addAddress(userId: string, addr: { label: string; address: string; note?: string }) {
    const id = `addr-${Date.now()}`;
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: { id, ...addr } } },
      { new: true },
    ).select('addresses').lean();
    if (!user) throw new NotFoundException('User not found');
    return user.addresses;
  }

  async deleteAddress(userId: string, addressId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { id: addressId } } },
      { new: true },
    ).select('addresses').lean();
    if (!user) throw new NotFoundException('User not found');
    return user.addresses;
  }

  // ---- Favorites ----
  async getFavorites(userId: string) {
    const user = await this.userModel.findById(userId).select('favorites').lean();
    if (!user) throw new NotFoundException('User not found');
    return user.favorites || [];
  }

  async toggleFavorite(userId: string, dishId: string) {
    const user = await this.userModel.findById(userId).select('favorites');
    if (!user) throw new NotFoundException('User not found');

    const idx = (user.favorites || []).indexOf(dishId);
    if (idx >= 0) {
      user.favorites.splice(idx, 1);
    } else {
      user.favorites = [...(user.favorites || []), dishId];
    }
    await user.save();
    return { favorites: user.favorites, isFavorite: idx < 0 };
  }

  // ---- Admin: list users ----
  async findAll(query: { role?: string; status?: string; page?: number; limit?: number }) {
    const { role, status, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async updateUserStatus(userId: string, status: 'Active' | 'Suspended') {
    const user = await this.userModel.findByIdAndUpdate(userId, { status }, { new: true }).select('-password').lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
