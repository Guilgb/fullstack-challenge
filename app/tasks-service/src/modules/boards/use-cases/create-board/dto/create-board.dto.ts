import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBoardOutputDto {
  @ApiProperty({ description: 'ID do board' })
  id: string;

  @ApiProperty({ description: 'Nome do board' })
  name: string;

  @ApiPropertyOptional({ description: 'Descrição do board' })
  description?: string;

  @ApiProperty({ description: 'ID do proprietário' })
  ownerId: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;
}

export class CreateBoardInputDto {
  @ApiProperty({ description: 'Nome do board' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Descrição do board' })
  @IsOptional()
  @IsString()
  description?: string;
}
