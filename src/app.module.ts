import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, //SI SE CREA ALGUN CAMBIO EN LAS ENTIDADES LAS SINCRONIZA AUTOMATICAMENTE, ES DECIR ELIMINA O AGREGA COLUMNAS DEPENDIENDO DE LAS MODIFICACIONES. EN PRODUCCION NO SE SUELE UTILIZAR
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
  ],
})
export class AppModule {}
