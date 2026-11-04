/**
 * AYO Food Delivery — Database Seed Script
 * Populates MongoDB with all restaurants, dishes, promo codes, and default users.
 * Run: npm run seed
 */
import 'reflect-metadata';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayo_food_delivery';

// ---- Schemas ----
const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, phone: String, role: String, status: { type: String, default: 'Active' }, favorites: [String], addresses: [{ id: String, label: String, address: String, note: String }] }, { timestamps: true });
const RestaurantSchema = new mongoose.Schema({ slug: String, name: String, cuisine: String, rating: Number, reviewsCount: Number, time: Number, fee: Number, minOrder: Number, status: String, priceLevel: String, featured: Boolean, address: String, phone: String, image: String, coverImage: String, description: String, approvalStatus: { type: String, default: 'active' }, ownerId: String }, { timestamps: true });
const DishSchema = new mongoose.Schema({ slug: String, restaurantId: String, restaurant: String, name: String, category: String, price: Number, originalPrice: Number, rating: Number, reviews: Number, prepTime: String, calories: String, dietary: [String], image: String, description: String, available: Boolean, isPopular: Boolean, options: Object }, { timestamps: true });
const PromoSchema = new mongoose.Schema({ code: String, type: String, value: Number, minOrder: Number, active: Boolean, description: String, usageCount: { type: Number, default: 0 } }, { timestamps: true });
const CourierSchema = new mongoose.Schema({ userId: String, name: String, phone: String, vehicle: String, rating: Number, isOnline: Boolean, zone: String, deliveriesToday: Number, earningsToday: Number, totalDeliveries: Number, totalEarnings: Number, avatar: String }, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);
const RestaurantModel = mongoose.model('Restaurant', RestaurantSchema);
const DishModel = mongoose.model('Dish', DishSchema);
const PromoModel = mongoose.model('Promo', PromoSchema);
const CourierModel = mongoose.model('Courier', CourierSchema);

// ---- Seed Data ----
const restaurants = [
  { slug: 'selam-kitchen', name: 'Selam Kitchen', cuisine: 'Ethiopian Cuisine', rating: 4.9, reviewsCount: 342, time: 25, fee: 35, minOrder: 150, status: 'Open', priceLevel: '$$', featured: true, address: 'Bole Medhanealem, Atlas Rd, Addis Ababa', phone: '+251 911 234 567', image: '/images/restaurants/selam-kitchen.jpg', coverImage: '/images/restaurants/selam-kitchen.jpg', description: 'Generous traditional Ethiopian platters, tender tibs, and vibrant vegan fasting dishes crafted daily with organic teff injera.' },
  { slug: 'ember-and-bun', name: 'Ember & Bun', cuisine: 'Burgers', rating: 4.8, reviewsCount: 289, time: 20, fee: 30, minOrder: 180, status: 'Open', priceLevel: '$$', featured: true, address: 'Kazanchis, Guinea Conakry St, Addis Ababa', phone: '+251 922 456 789', image: '/images/restaurants/ember-and-bun.jpg', coverImage: '/images/restaurants/ember-and-bun.jpg', description: 'Artisanal smash burgers with house-made smoky sauces, caramelized onions, and golden hand-cut fries in buttery brioche.' },
  { slug: 'pizzetta-roma', name: 'Pizzetta Artisanal', cuisine: 'Pizza', rating: 4.7, reviewsCount: 215, time: 30, fee: 40, minOrder: 200, status: 'Open', priceLevel: '$$', featured: true, address: 'Sarbet, South Africa St, Addis Ababa', phone: '+251 933 789 012', image: '/images/restaurants/pizzetta-roma.jpg', coverImage: '/images/restaurants/pizzetta-roma.jpg', description: '48-hour slow-fermented sourdough pizza baked in our wood-fired oven using San Marzano tomatoes and creamy fior di latte.' },
  { slug: 'mamas-golden-chicken', name: "Mama's Golden Crispy", cuisine: 'Chicken', rating: 4.8, reviewsCount: 198, time: 25, fee: 30, minOrder: 160, status: 'Open', priceLevel: '$$', featured: false, address: 'Bole Rwanda, Cameroon St, Addis Ababa', phone: '+251 944 123 456', image: '/images/restaurants/mamas-golden-chicken.jpg', coverImage: '/images/restaurants/mamas-golden-chicken.jpg', description: 'Secret 12-spice buttermilk fried chicken, crunchy honey-glazed tenders, and signature peri-peri garlic dips.' },
  { slug: 'verde-garden', name: 'Verde Garden Bowls', cuisine: 'Vegetarian', rating: 4.9, reviewsCount: 164, time: 20, fee: 25, minOrder: 140, status: 'Open', priceLevel: '$', featured: true, address: 'Old Airport, Golf Club Rd, Addis Ababa', phone: '+251 955 890 234', image: '/images/restaurants/verde-garden.jpg', coverImage: '/images/restaurants/verde-garden.jpg', description: 'Vibrant organic grain bowls, grilled avocado salads, and crisp falafel boxes designed for wholesome, energized dining.' },
  { slug: 'roma-bella-pasta', name: 'Roma Bella Trattoria', cuisine: 'Pasta', rating: 4.7, reviewsCount: 182, time: 35, fee: 40, minOrder: 220, status: 'Open', priceLevel: '$$$', featured: false, address: 'Piazza, Churchill Ave, Addis Ababa', phone: '+251 966 345 678', image: '/images/restaurants/roma-bella-pasta.jpg', coverImage: '/images/restaurants/roma-bella-pasta.jpg', description: 'Hand-rolled fresh egg tagliatelle, creamy Roman carbonara, and slow-braised beef bolognese topped with aged Parmigiano.' },
  { slug: 'habesha-bites', name: 'Habesha Bites & Snacks', cuisine: 'Snacks', rating: 4.6, reviewsCount: 140, time: 18, fee: 25, minOrder: 100, status: 'Open', priceLevel: '$', featured: false, address: 'Gerji, Imperial Area, Addis Ababa', phone: '+251 977 901 345', image: '/images/restaurants/habesha-bites.jpg', coverImage: '/images/restaurants/habesha-bites.jpg', description: 'Crispy hand-folded lentil and beef sambusas, roasted kolo, spicy potato wedges, and quick tasty Ethiopian tea bites.' },
  { slug: 'oasis-juice-bar', name: 'Oasis Juice & Tea Bar', cuisine: 'Drinks', rating: 4.8, reviewsCount: 220, time: 15, fee: 20, minOrder: 80, status: 'Closed', priceLevel: '$', featured: false, address: 'Bole Brass, Ring Road, Addis Ababa', phone: '+251 988 234 890', image: '/images/restaurants/oasis-juice-bar.jpg', coverImage: '/images/restaurants/oasis-juice-bar.jpg', description: 'Layered fresh avocado-mango spris, chilled hibiscus cold brews, fresh passionfruit blends, and organic iced teas.' },
];

const dishes = [
  { slug: 'd1', restaurantId: 'selam-kitchen', restaurant: 'Selam Kitchen', name: 'Royal Beyaynetu Platter', category: 'Ethiopian Cuisine', price: 320, originalPrice: 360, rating: 4.9, reviews: 142, prepTime: '20 min', calories: '650 kcal', dietary: ['Vegetarian', 'Vegan', 'Fasting Friendly'], image: '/images/dishes/dish-d1.jpg', description: 'A feast of 8 vibrant vegetable & lentil dishes: misir wot, kik alicha, gomen, shiro, and beet salad served on fluffy 100% teff injera.', available: true, isPopular: true, options: { spiciness: ['Mild', 'Medium Spiced', 'Traditional Spicy'], addExtra: ['Extra Injera (+30 ETB)', 'Ayib Cheese (+40 ETB)', 'Extra Gomen (+35 ETB)'] } },
  { slug: 'd2', restaurantId: 'selam-kitchen', restaurant: 'Selam Kitchen', name: 'Sizzling Special Tibs', category: 'Ethiopian Cuisine', price: 390, rating: 4.8, reviews: 98, prepTime: '25 min', calories: '720 kcal', dietary: ['High Protein'], image: '/images/dishes/dish-d2.jpg', description: 'Tender cubes of prime beef or lamb sautéed with rosemary, jalapeños, onions, and tomatoes in a clay pot. Served with injera.', available: true, isPopular: true, options: { meat: ['Beef', 'Lamb', 'Goat'], spiciness: ['Mild', 'Medium', 'Spicy'], cook: ['Rare', 'Medium', 'Well Done'] } },
  { slug: 'd3', restaurantId: 'selam-kitchen', restaurant: 'Selam Kitchen', name: 'Doro Wot & Injera', category: 'Ethiopian Cuisine', price: 350, rating: 4.7, reviews: 76, prepTime: '30 min', calories: '580 kcal', dietary: [], image: '/images/dishes/dish-d3.jpg', description: 'Slow-simmered chicken legs in rich berbere sauce with hard-boiled eggs. Ethiopia\'s iconic national dish served with soft injera.', available: true, isPopular: false, options: { extras: ['Extra Egg (+15 ETB)', 'Extra Berbere Sauce (+20 ETB)'] } },
  { slug: 'd4', restaurantId: 'ember-and-bun', restaurant: 'Ember & Bun', name: 'The Classic Smash Burger', category: 'Burgers', price: 280, originalPrice: 320, rating: 4.9, reviews: 203, prepTime: '15 min', calories: '820 kcal', dietary: ['High Protein'], image: '/images/dishes/dish-d4.jpg', description: 'Double smash patty pressed thin on a scorching flat iron, American cheddar, crispy pickles, caramelized onions, and ember sauce in a brioche bun.', available: true, isPopular: true, options: { patty: ['Single (180g)', 'Double (360g)', 'Triple (540g)'], cheese: ['American Cheddar', 'Pepper Jack', 'No Cheese'], extras: ['Extra Sauce (+10 ETB)', 'Bacon (+40 ETB)', 'Fried Egg (+25 ETB)'] } },
  { slug: 'd5', restaurantId: 'ember-and-bun', restaurant: 'Ember & Bun', name: 'Spicy Habanero Burger', category: 'Burgers', price: 295, rating: 4.7, reviews: 134, prepTime: '15 min', calories: '780 kcal', dietary: ['Spicy'], image: '/images/dishes/dish-d5.jpg', description: 'For the heat-seekers: two smash patties with habanero aioli, jalapeños, pepper jack, pickled onions, and sriracha slaw.', available: true, isPopular: false, options: { heatLevel: ['Medium Heat', 'Extra Spicy', 'Maximum Burn 🔥'] } },
  { slug: 'd6', restaurantId: 'pizzetta-roma', restaurant: 'Pizzetta Artisanal', name: 'Margherita Classica', category: 'Pizza', price: 340, rating: 4.8, reviews: 187, prepTime: '25 min', calories: '700 kcal', dietary: ['Vegetarian'], image: '/images/dishes/dish-d6.jpg', description: 'San Marzano tomato passata, imported fior di latte mozzarella, hand-torn fresh basil, and cold-pressed Sicilian olive oil on 48h sourdough.', available: true, isPopular: true, options: { size: ['25cm Personal', '32cm Standard', '40cm Large'], crust: ['Thin & Crispy', 'Airy Sourdough', 'Stuffed Crust (+30 ETB)'], extras: ['Extra Cheese (+25 ETB)', 'Chilli Oil (+10 ETB)'] } },
  { slug: 'd7', restaurantId: 'pizzetta-roma', restaurant: 'Pizzetta Artisanal', name: 'Pepperoni Diavola', category: 'Pizza', price: 385, rating: 4.7, reviews: 145, prepTime: '25 min', calories: '850 kcal', dietary: [], image: '/images/dishes/dish-d7.jpg', description: 'Calabrian hot salami, smoked mozzarella, fresh chilli, tomato, and oregano with a honey drizzle on our signature sourdough base.', available: true, isPopular: false, options: { size: ['25cm Personal', '32cm Standard', '40cm Large'], extras: ['Double Pepperoni (+50 ETB)', 'Jalapeños (+15 ETB)'] } },
  { slug: 'd8', restaurantId: 'mamas-golden-chicken', restaurant: "Mama's Golden Crispy", name: "Mama's 6-Piece Crispy Box", category: 'Chicken', price: 320, rating: 4.9, reviews: 167, prepTime: '20 min', calories: '950 kcal', dietary: [], image: '/images/dishes/dish-d8.jpg', description: '6 pieces of 12-spice buttermilk-brined fried chicken in ultra-crispy breadcrumb coating. Served with golden fries and honey-mustard dip.', available: true, isPopular: true, options: { type: ['Original Recipe', 'Spicy Crispy', 'Honey Glazed'], sides: ['Fries (Included)', 'Coleslaw (+30 ETB)', 'Mac & Cheese (+40 ETB)'], dip: ['Honey Mustard', 'Garlic Aioli', 'BBQ Sauce', 'Peri-Peri'] } },
  { slug: 'd9', restaurantId: 'mamas-golden-chicken', restaurant: "Mama's Golden Crispy", name: 'Crispy Chicken Sandwich', category: 'Chicken', price: 220, rating: 4.7, reviews: 89, prepTime: '15 min', calories: '640 kcal', dietary: [], image: '/images/dishes/dish-d9.jpg', description: 'Thick buttermilk-marinated crispy fillet, crunchy pickles, shredded lettuce, and signature comeback sauce in a toasted brioche bun.', available: true, isPopular: false, options: { style: ['Original', 'Spicy', 'BBQ'], extras: ['Add Cheese (+20 ETB)', 'Extra Sauce (+10 ETB)'] } },
  { slug: 'd10', restaurantId: 'verde-garden', restaurant: 'Verde Garden Bowls', name: 'Harvest Grain Bowl', category: 'Vegetarian', price: 240, rating: 4.9, reviews: 128, prepTime: '15 min', calories: '480 kcal', dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'], image: '/images/dishes/dish-d10.jpg', description: 'Warm quinoa and brown rice base, roasted sweet potatoes, spiced chickpeas, avocado, cherry tomatoes, and tahini-lemon drizzle.', available: true, isPopular: true, options: { base: ['Quinoa & Brown Rice', 'Cauliflower Rice', 'Mixed Greens'], protein: ['Chickpeas', 'Grilled Tofu (+30 ETB)', 'Falafel (+25 ETB)'], dressing: ['Tahini-Lemon', 'Avocado-Herb', 'Balsamic'] } },
  { slug: 'd11', restaurantId: 'verde-garden', restaurant: 'Verde Garden Bowls', name: 'Crispy Falafel Box', category: 'Vegetarian', price: 195, rating: 4.8, reviews: 82, prepTime: '15 min', calories: '420 kcal', dietary: ['Vegetarian', 'Vegan', 'Fasting Friendly'], image: '/images/dishes/dish-d11.jpg', description: '8 golden crispy falafels stuffed in warm pita with hummus, shredded cabbage, cucumber, tomato, and harissa sauce.', available: true, isPopular: false, options: { extras: ['Extra Hummus (+20 ETB)', 'Extra Falafel x4 (+40 ETB)'] } },
  { slug: 'd12', restaurantId: 'roma-bella-pasta', restaurant: 'Roma Bella Trattoria', name: 'Cacio e Pepe Tagliatelle', category: 'Pasta', price: 310, rating: 4.8, reviews: 112, prepTime: '20 min', calories: '760 kcal', dietary: ['Vegetarian'], image: '/images/dishes/dish-d12.jpg', description: 'Roman-style hand-rolled egg tagliatelle with aged Pecorino Romano, Parmigiano Reggiano, and a generous crack of black pepper.', available: true, isPopular: true, options: { size: ['Regular', 'Large (+50 ETB)'], extras: ['Add Prosciutto (+60 ETB)', 'Add Truffle Oil (+45 ETB)'] } },
  { slug: 'd13', restaurantId: 'roma-bella-pasta', restaurant: 'Roma Bella Trattoria', name: 'Slow-Braised Bolognese', category: 'Pasta', price: 350, rating: 4.7, reviews: 96, prepTime: '25 min', calories: '880 kcal', dietary: [], image: '/images/dishes/dish-d13.jpg', description: '4-hour slow-braised prime beef and pork ragù with San Marzano tomatoes, red wine reduction, and tagliatelle. Finished with Parmigiano.', available: true, isPopular: false, options: { size: ['Regular', 'Large (+50 ETB)'], extras: ['Extra Parmigiano (+25 ETB)'] } },
  { slug: 'd14', restaurantId: 'habesha-bites', restaurant: 'Habesha Bites & Snacks', name: 'Lentil Sambusa (6 pcs)', category: 'Snacks', price: 120, rating: 4.7, reviews: 94, prepTime: '12 min', calories: '380 kcal', dietary: ['Vegetarian', 'Vegan', 'Fasting Friendly'], image: '/images/dishes/dish-d14.jpg', description: '6 crispy hand-folded sambusas stuffed with spiced red lentils, onions, and green peppers. Served with tangy awaze dipping sauce.', available: true, isPopular: true, options: { filling: ['Lentil (Vegetarian)', 'Spiced Beef', 'Mixed Lentil & Beef'], sauce: ['Awaze Hot Sauce', 'Yoghurt Dip', 'Mitmita Paste'] } },
  { slug: 'd15', restaurantId: 'habesha-bites', restaurant: 'Habesha Bites & Snacks', name: 'Spicy Potato Wedges', category: 'Snacks', price: 95, rating: 4.6, reviews: 67, prepTime: '15 min', calories: '420 kcal', dietary: ['Vegetarian', 'Vegan'], image: '/images/dishes/dish-d15.jpg', description: 'Thick-cut potato wedges seasoned with berbere, smoked paprika, and garlic. Oven-roasted to crispy perfection.', available: true, isPopular: false, options: { spice: ['Mild', 'Medium', 'Extra Hot'], dip: ['Garlic Mayo', 'Ketchup', 'Spicy Awaze'] } },
  { slug: 'd16', restaurantId: 'oasis-juice-bar', restaurant: 'Oasis Juice & Tea Bar', name: 'Avocado Mango Spris', category: 'Drinks', price: 145, rating: 4.9, reviews: 189, prepTime: '8 min', calories: '380 kcal', dietary: ['Vegetarian', 'Vegan'], image: '/images/dishes/dish-d16.jpg', description: 'Ethiopia\'s beloved layered juice: fresh papaya, mango, avocado, and orange blended separately and poured in vibrant stacked layers.', available: true, isPopular: true, options: { size: ['Regular (400ml)', 'Large (600ml +30 ETB)'], sweetness: ['No Sugar', 'Light Honey', 'Regular Honey'] } },
  { slug: 'd17', restaurantId: 'oasis-juice-bar', restaurant: 'Oasis Juice & Tea Bar', name: 'Hibiscus Cold Brew', category: 'Drinks', price: 95, rating: 4.8, reviews: 134, prepTime: '5 min', calories: '45 kcal', dietary: ['Vegetarian', 'Vegan'], image: '/images/dishes/dish-d17.jpg', description: 'Dried hibiscus flowers cold-steeped for 12 hours with ginger, lemon, and light honey. Rich, tart, and refreshing.', available: true, isPopular: false, options: { size: ['Regular (350ml)', 'Large (500ml +20 ETB)'], ice: ['No Ice', 'Light Ice', 'Full Ice'] } },
  { slug: 'd18', restaurantId: 'selam-kitchen', restaurant: 'Selam Kitchen', name: 'Vegetarian Fasting Combo', category: 'Ethiopian Cuisine', price: 280, rating: 4.8, reviews: 87, prepTime: '20 min', calories: '520 kcal', dietary: ['Vegetarian', 'Vegan', 'Fasting Friendly'], image: '/images/dishes/dish-d18.jpg', description: 'A traditional fasting platter with gomen, misir, kik alicha, and dinich wot served on teff injera. Perfect for Ethiopian fasting days.', available: true, isPopular: false, options: { extras: ['Add Ful Medames (+35 ETB)', 'Extra Injera (+30 ETB)'] } },
  { slug: 'd19', restaurantId: 'ember-and-bun', restaurant: 'Ember & Bun', name: 'Golden Fries & Dips', category: 'Snacks', price: 120, rating: 4.6, reviews: 143, prepTime: '10 min', calories: '480 kcal', dietary: ['Vegetarian'], image: '/images/dishes/dish-d19.jpg', description: 'Thick hand-cut fries double-fried to extra-crispy perfection with a seasoned crust, served with your choice of 3 artisan dipping sauces.', available: true, isPopular: false, options: { style: ['Regular Cut', 'Waffle Cut', 'Curly Fries'], dips: ['Ember Sauce', 'Garlic Aioli', 'Truffle Mayo', 'Ketchup'] } },
];

const promos = [
  { code: 'AYO50', type: 'fixed', value: 50, minOrder: 200, active: true, description: 'Get 50 ETB off your first order over 200 ETB' },
  { code: 'TASTY20', type: 'percentage', value: 20, minOrder: 300, active: true, description: '20% off orders over 300 ETB' },
  { code: 'FREESHIP', type: 'free_delivery', value: 35, minOrder: 250, active: true, description: 'Free delivery on orders over 250 ETB' },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log(`✅ Connected: ${MONGODB_URI}\n`);

  // Clear existing data
  await Promise.all([
    RestaurantModel.deleteMany({}),
    DishModel.deleteMany({}),
    PromoModel.deleteMany({}),
    CourierModel.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing restaurants, dishes, promos, couriers');

  // Seed restaurants
  const createdRestaurants = await RestaurantModel.insertMany(restaurants);
  console.log(`🍽️  Seeded ${createdRestaurants.length} restaurants`);

  // Seed dishes
  const createdDishes = await DishModel.insertMany(dishes);
  console.log(`🥘  Seeded ${createdDishes.length} dishes`);

  // Seed promos
  await PromoModel.insertMany(promos);
  console.log(`🏷️  Seeded ${promos.length} promo codes`);

  // Create default users (skip if they already exist)
  const defaultUsers = [
    { name: 'Demo Customer', email: 'customer@ayo.food', password: 'demo1234', phone: '+251 911 888 999', role: 'customer' },
    { name: 'Demo Restaurant', email: 'restaurant@ayo.food', password: 'demo1234', phone: '+251 911 234 567', role: 'restaurant_owner' },
    { name: 'Demo Courier', email: 'courier@ayo.food', password: 'demo1234', phone: '+251 922 110 099', role: 'delivery_agent' },
    { name: 'Super Admin', email: 'admin@ayo.food', password: 'admin1234', phone: '+251 900 000 001', role: 'admin' },
  ];

  for (const u of defaultUsers) {
    const exists = await UserModel.findOne({ email: u.email });
    if (!exists) {
      const hashed = await bcrypt.hash(u.password, 12);
      const created = await UserModel.create({ ...u, password: hashed });
      console.log(`👤 Created user: ${u.email} (${u.role})`);

      // Create courier profile for delivery agent
      if (u.role === 'delivery_agent') {
        await CourierModel.create({
          userId: created._id.toString(),
          name: u.name,
          phone: u.phone,
          vehicle: 'TVS Apache 160 (Plate: AA 3-89412)',
          rating: 4.95,
          isOnline: true,
          zone: 'Bole / Atlas / Kazanchis',
          deliveriesToday: 7,
          earningsToday: 245,
          totalDeliveries: 65,
          totalEarnings: 2275,
          avatar: 'assets/images/avatars/avatar-courier.jpg',
        });
        console.log(`🛵 Created courier profile for: ${u.name}`);
      }
    } else {
      console.log(`⏩ Skipped existing user: ${u.email}`);
    }
  }

  console.log('\n✅ Seed complete! Your AYO database is ready.');
  console.log('\n📋 Demo credentials:');
  console.log('   Customer:  customer@ayo.food / demo1234');
  console.log('   Restaurant: restaurant@ayo.food / demo1234');
  console.log('   Courier:   courier@ayo.food / demo1234');
  console.log('   Admin:     admin@ayo.food / admin1234\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
