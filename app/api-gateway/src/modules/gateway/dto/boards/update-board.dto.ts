import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateBoardParamsDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  id: string;
}

export class UpdateBoardInputDto {
  @ApiPropertyOptional({ description: 'Nome do board' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do board' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateBoardOutputDto {
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
