import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from '../schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
  ) {}

  async findAll(query: {
    search?: string;
    cuisine?: string;
    priceLevel?: string;
    status?: string;
    featured?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search, cuisine, priceLevel, status, featured,
      sort = 'rating', page = 1, limit = 20,
    } = query;

    const filter: any = {};
    if (search) filter.$text = { $search: search };
    if (cuisine) filter.cuisine = { $regex: cuisine, $options: 'i' };
    if (priceLevel) filter.priceLevel = priceLevel;
    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured;

    const sortMap: Record<string, any> = {
      rating: { rating: -1 },
      reviews: { reviewsCount: -1 },
      time: { time: 1 },
      fee: { fee: 1 },
      name: { name: 1 },
    };
    const sortObj = sortMap[sort] || { rating: -1 };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.restaurantModel.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      this.restaurantModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const r = await this.restaurantModel.findOne({ slug }).lean();
    if (!r) throw new NotFoundException(`Restaurant "${slug}" not found`);
    return r;
  }

  async findById(id: string) {
    const r = await this.restaurantModel.findById(id).lean();
    if (!r) throw new NotFoundException('Restaurant not found');
    return r;
  }

  async create(dto: CreateRestaurantDto, ownerId?: string) {
    const exists = await this.restaurantModel.findOne({ slug: dto.slug });
    if (exists) throw new ConflictException(`Slug "${dto.slug}" already taken`);
    return this.restaurantModel.create({ ...dto, ownerId: ownerId || null });
  }

  async update(id: string, updates: Partial<CreateRestaurantDto & { status: string; approvalStatus: string }>) {
    const r = await this.restaurantModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!r) throw new NotFoundException('Restaurant not found');
    return r;
  }

  async updateStatus(id: string, status: 'Open' | 'Closed') {
    return this.update(id, { status });
  }

  async delete(id: string) {
    const r = await this.restaurantModel.findByIdAndDelete(id);
    if (!r) throw new NotFoundException('Restaurant not found');
    return { message: 'Restaurant deleted' };
  }

  async getStats() {
    const [total, open, featured] = await Promise.all([
      this.restaurantModel.countDocuments(),
      this.restaurantModel.countDocuments({ status: 'Open' }),
      this.restaurantModel.countDocuments({ featured: true }),
    ]);
    return { total, open, closed: total - open, featured };
  }
}
