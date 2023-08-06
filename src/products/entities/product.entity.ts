import { User } from './../../auth/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '25438bb0-a312-482f-82e5-211046d7788c',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 30,
    description: 'Product Price',
    uniqueItems: false,
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Man Clothes',
    description: 'Product Description',
    uniqueItems: false,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product Slug for SEO',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 50,
    description: 'Product Stock',
    uniqueItems: false,
  })
  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'XL'],
    description: 'Product Sizes',
    uniqueItems: false,
  })
  @Column({
    type: 'text',
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'male',
    description: 'Product Gender',
    uniqueItems: false,
  })
  @Column({
    type: 'text',
  })
  gender: string;

  @ApiProperty({
    example: ['sweatshirt', 'shirt'],
    description: 'Product Tags',
    uniqueItems: false,
  })
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty({
    example: [
      'http://img-8528839-00-A_0_2000.jpg',
      'http://img-8528839-00-A_2.jpg',
    ],
    description: 'Product Tags',
    uniqueItems: false,
  })
  //images
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true, //cargaria los datos de la relacion en los metodos find
  })
  images?: ProductImage[];

  //user
  @ManyToOne(() => User, (user) => user.product, {
    onDelete: 'CASCADE',
  })
  user: User;

  // @Column({
  //   type: 'int',
  //   array: true,
  //   default: [],
  // })
  // productImageId: number[];
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
