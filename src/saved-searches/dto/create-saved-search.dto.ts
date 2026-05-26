import { IsString, IsNotEmpty, MaxLength, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSavedSearchDto {
  @ApiProperty({ example: 'My Electronics Search' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'ProductQuery object to save', type: 'object' })
  @IsObject()
  query: Record<string, unknown>;
}
