import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CouriersController } from './couriers.controller';
import { CouriersService } from './couriers.service';
import { Courier, CourierSchema } from '../schemas/courier.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Courier.name, schema: CourierSchema }]),
    AuthModule,
  ],
  controllers: [CouriersController],
  providers: [CouriersService],
  exports: [CouriersService],
})
export class CouriersModule {}
