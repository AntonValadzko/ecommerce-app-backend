import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AutocompleteQueryDto {
  @ApiProperty({ description: 'Search term' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ description: 'Max suggestions to return', default: 10 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value as string, 10) : 10))
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 10;
}
