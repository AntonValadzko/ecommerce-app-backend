import { Controller, Get, Param, Query, ParseIntPipe, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ProductsService } from './products.service';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  private readonly pageSizeOptions: number[];

  constructor(
    private readonly productsService: ProductsService,
    configService: ConfigService,
  ) {
    this.pageSizeOptions = configService.get<number[]>('allowedPageSizes')!;
  }

  private getBaseUrl(req: Request): string {
    return `${req.protocol}://${req.get('host')}`;
  }

  @Get()
  @ApiOperation({ summary: 'List products with filtering, sorting and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated product list with SEO meta' })
  async findAll(
    @Query() dto: ProductListQueryDto,
    @Req() req: Request,
  ) {
    const query = dto.toProductQuery();
    const baseUrl = this.getBaseUrl(req);
    const result = await this.productsService.listProducts(query);
    const seo = this.productsService.buildListingSeo(query, result.total, baseUrl);
    return {
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      },
      meta: {
        sort: dto.sort,
        pageSizeOptions: this.pageSizeOptions,
        infiniteScroll: Boolean(dto.cursor),
        seo,
      },
    };
  }

  @Get('facets')
  @ApiOperation({ summary: 'Get filter facets for current query' })
  @ApiResponse({ status: 200, description: 'Facets: brands, price range, ratings, attributes' })
  async getFacets(@Query() dto: ProductListQueryDto) {
    return { data: await this.productsService.getFacets(dto.toProductQuery()) };
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete search suggestions' })
  @ApiQuery({ name: 'q', description: 'Search term', required: true })
  @ApiQuery({ name: 'limit', description: 'Max suggestions', required: false })
  @ApiResponse({ status: 200, description: 'List of autocomplete suggestions' })
  async autocomplete(@Query() dto: AutocompleteQueryDto) {
    return { data: await this.productsService.autocomplete(dto.q, dto.limit) };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @ApiResponse({ status: 200, description: 'Product detail with SEO meta' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const baseUrl = this.getBaseUrl(req);
    const product = await this.productsService.getProductBySlug(slug);
    const seo = this.productsService.buildProductSeo(product, baseUrl);
    return { data: product, meta: { seo } };
  }

  @Get(':id/quick-view')
  @ApiOperation({ summary: 'Get condensed product data for quick view modal' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Quick view product data' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getQuickView(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.productsService.getQuickView(id) };
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'List of related products' })
  async getRelated(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.productsService.getRelatedProducts(id) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product detail with SEO meta' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const baseUrl = this.getBaseUrl(req);
    const product = await this.productsService.getProduct(id);
    const seo = this.productsService.buildProductSeo(product, baseUrl);
    return { data: product, meta: { seo } };
  }
}
