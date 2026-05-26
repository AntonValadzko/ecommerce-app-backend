import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsPresenter } from './products.presenter';
import { ProductsService } from '../../../application/products/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsPresenter],
})
export class ProductsModule {}
