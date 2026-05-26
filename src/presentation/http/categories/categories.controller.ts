import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from '../../../application/categories/categories.service';
import { CategoriesPresenter } from './categories.presenter';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly presenter: CategoriesPresenter,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all categories with product counts' })
  @ApiResponse({ status: 200, description: 'Flat list of all categories' })
  async findAll() {
    return this.presenter.toDataResponse(await this.categoriesService.getAll());
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get nested category tree' })
  @ApiResponse({ status: 200, description: 'Hierarchical category tree for navigation' })
  async getTree() {
    return this.presenter.toDataResponse(await this.categoriesService.getTree());
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.presenter.toDataResponse(await this.categoriesService.getBySlug(slug));
  }
}
