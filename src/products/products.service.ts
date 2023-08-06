import { User } from './../auth/entities/user.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from './../common/dtos/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities';
import { Product } from './entities/product.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((img) =>
          this.productImageRepository.create({ url: img }),
        ),
        user,
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      // join: {
      //   alias: 'pImg',
      //   innerJoinAndSelect: { images: 'pImg.images' },
      // },
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },

      // select: [
      //   'id',
      //   'title',
      //   'price',
      //   'description',
      //   'slug',
      //   'sizes',
      //   'gender',
      //   'tags',
      //   'images',
      // ],
    });
    return products.map((product) => ({
      ...product,
      images: product.images.map(
        (img) => `http://localhost:3000/api/files/product/${img.url}`,
      ),
    }));
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // product = await this.productRepository.findOneBy({ slug: term });
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .leftJoinAndSelect('prod.images', 'proImages') //left join devuelve asi la relacion de alguna fila este vacia
        .where(' UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        // .select(['prod.id', 'proImages.url'])
        .getOne();
    }
    // const product = await this.productRepository.findOneBy({ term });
    if (!product) throw new NotFoundException('Product was not found');
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    // const productToUpdate = await this.productRepository.findOneBy({ id });
    // if (!productToUpdate)
    //   throw new BadRequestException('Product was not found');
    // await this.productRepository.update(id, updateProductDto);

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate,
    }); //ESTO BUSCA UN PRODUCTO POR SU ID

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    product.user = user;

    //Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } }); //se pone product porque product es el nombre de la relacion

        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const productToDelete = await this.findOne(id);
    if (!productToDelete)
      throw new BadRequestException('Product was not found');
    // await this.productRepository.delete(id);
    await this.productRepository.remove(productToDelete);
    return `This action removes a #${id} product`;
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('builder');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
