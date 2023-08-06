import { User } from './../auth/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertNewUsers();
    await this.insertNewProducts(adminUser);

    return 'SEED EXECUTED';
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    await this.userRepository.delete({});
    const query = this.userRepository.createQueryBuilder('builder');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach(async (user) => {
      users.push(this.userRepository.create(user));
    });
    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises = [];
    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });
    await Promise.all(insertPromises);
    return true;
  }
  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      // this.logger.error(error);
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
