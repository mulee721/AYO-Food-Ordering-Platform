import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { DishesModule } from './dishes/dishes.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { CouriersModule } from './couriers/couriers.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    // Config — loads .env file
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/ayo_food_delivery'),
        connectionFactory: (connection) => {
          console.log(`✅ MongoDB connected: ${connection.host}/${connection.name}`);
          return connection;
        },
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    RestaurantsModule,
    DishesModule,
    OrdersModule,
    CartModule,
    AdminModule,
    CouriersModule,
  ],
})
export class AppModule {}
