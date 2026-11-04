import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dish, DishDocument } from '../schemas/dish.schema';
import { CreateDishDto } from './dto/create-dish.dto';

@Injectable()
export class DishesService {
  constructor(@InjectModel(Dish.name) private dishModel: Model<DishDocument>) {}

  async findAll(query: {
    search?: string;
    category?: string;
    restaurantId?: string;
    dietary?: string;
    popularOnly?: boolean;
    available?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search, category, restaurantId, dietary,
      popularOnly, available, sort = 'popular', page = 1, limit = 50,
    } = query;

    const filter: any = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (restaurantId) filter.restaurantId = restaurantId;
    if (dietary) filter.dietary = { $in: [dietary] };
    if (popularOnly) filter.isPopular = true;
    if (available !== undefined) filter.available = available === true || available === ('true' as any);

    const sortMap: Record<string, any> = {
      popular: { isPopular: -1, rating: -1 },
      rating: { rating: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      name: { name: 1 },
    };
    const sortObj = sortMap[sort] || { isPopular: -1, rating: -1 };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.dishModel.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      this.dishModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findBySlug(slug: string) {
    const d = await this.dishModel.findOne({ slug }).lean();
    if (!d) throw new NotFoundException(`Dish "${slug}" not found`);
    return d;
  }

  async findById(id: string) {
    const d = await this.dishModel.findById(id).lean();
    if (!d) throw new NotFoundException('Dish not found');
    return d;
  }

  async findByRestaurant(restaurantId: string) {
    return this.dishModel.find({ restaurantId }).sort({ category: 1, isPopular: -1 }).lean();
  }

  async create(dto: CreateDishDto) {
    const exists = await this.dishModel.findOne({ slug: dto.slug });
    if (exists) throw new ConflictException(`Dish slug "${dto.slug}" already exists`);
    return this.dishModel.create(dto);
  }

  async update(id: string, updates: Partial<CreateDishDto>) {
    const d = await this.dishModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!d) throw new NotFoundException('Dish not found');
    return d;
  }

  async toggleAvailability(id: string) {
    const dish = await this.dishModel.findById(id);
    if (!dish) throw new NotFoundException('Dish not found');
    dish.available = !dish.available;
    await dish.save();
    return { available: dish.available, message: dish.available ? 'Dish marked as available' : 'Dish marked as sold out' };
  }

  async delete(id: string) {
    const d = await this.dishModel.findByIdAndDelete(id);
    if (!d) throw new NotFoundException('Dish not found');
    return { message: 'Dish deleted' };
  }

  async getCategories() {
    return this.dishModel.distinct('category');
  }
}
