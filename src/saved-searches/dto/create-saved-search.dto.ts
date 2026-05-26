import { IsString, IsNotEmpty, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SavedProductQueryDto } from './product-query.dto';

export class CreateSavedSearchDto {
  @ApiProperty({ example: 'My Electronics Search' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'ProductQuery object to save', type: SavedProductQueryDto })
  @ValidateNested()
  @Type(() => SavedProductQueryDto)
  query: SavedProductQueryDto;
}
