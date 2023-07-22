import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [ConfigModule, TypeOrmModule.forFeature([Product, ProductImage])],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
