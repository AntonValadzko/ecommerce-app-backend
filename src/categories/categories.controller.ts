import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories with product counts' })
  @ApiResponse({ status: 200, description: 'Flat list of all categories' })
  async findAll() {
    return { data: await this.categoriesService.getAll() };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get nested category tree' })
  @ApiResponse({ status: 200, description: 'Hierarchical category tree for navigation' })
  async getTree() {
    return { data: await this.categoriesService.getTree() };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    return { data: await this.categoriesService.getBySlug(slug) };
  }
}
