import { Module } from '@nestjs/common';
import { ProductsModule } from './../products/products.module';
import { ProductsService } from './../products/products.service';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  controllers: [SeedController],
  providers: [SeedService, ProductsService],
  imports: [ProductsModule],
})
export class SeedModule {}
