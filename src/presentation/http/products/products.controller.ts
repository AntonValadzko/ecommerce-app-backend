import { Controller, Get, Param, Query, ParseIntPipe, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ProductsService } from '../../../application/products/products.service';
import { ProductsPresenter } from './products.presenter';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto';
import { getBaseUrl } from '../common/utils/base-url';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly presenter: ProductsPresenter,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List products with filtering, sorting and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated product list with SEO meta' })
  async findAll(@Query() dto: ProductListQueryDto, @Req() req: Request) {
    const query = dto.toProductQuery();
    const result = await this.productsService.listProducts(query);
    return this.presenter.toListResponse(
      result,
      query,
      dto.sort,
      Boolean(dto.cursor),
      getBaseUrl(req),
    );
  }

  @Get('facets')
  @ApiOperation({ summary: 'Get filter facets for current query' })
  @ApiResponse({ status: 200, description: 'Facets: brands, price range, ratings, attributes' })
  async getFacets(@Query() dto: ProductListQueryDto) {
    const facets = await this.productsService.getFacets(dto.toProductQuery());
    return this.presenter.toDataResponse(facets);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete search suggestions' })
  @ApiQuery({ name: 'q', description: 'Search term', required: true })
  @ApiQuery({ name: 'limit', description: 'Max suggestions', required: false })
  @ApiResponse({ status: 200, description: 'List of autocomplete suggestions' })
  async autocomplete(@Query() dto: AutocompleteQueryDto) {
    const suggestions = await this.productsService.autocomplete(dto.q, dto.limit);
    return this.presenter.toDataResponse(suggestions);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @ApiResponse({ status: 200, description: 'Product detail with SEO meta' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const product = await this.productsService.getProductBySlug(slug);
    return this.presenter.toDetailResponse(product, getBaseUrl(req));
  }

  @Get(':id/quick-view')
  @ApiOperation({ summary: 'Get condensed product data for quick view modal' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Quick view product data' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getQuickView(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.getQuickView(id);
    return this.presenter.toDataResponse(product);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'List of related products' })
  async getRelated(@Param('id', ParseIntPipe) id: number) {
    const related = await this.productsService.getRelatedProducts(id);
    return this.presenter.toDataResponse(related);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product detail with SEO meta' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const product = await this.productsService.getProduct(id);
    return this.presenter.toDetailResponse(product, getBaseUrl(req));
  }
}
