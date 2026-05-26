import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesPresenter } from './categories.presenter';
import { CategoriesService } from '../../../application/categories/categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesPresenter],
})
export class CategoriesModule {}
