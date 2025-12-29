import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BoardResponseDto } from '../../get-board/dto/get-board.dto';

export class ListBoardsQueryDto {
  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Tamanho da página', default: 10 })
  @IsOptional()
  pageSize?: number;
}

export class ListBoardsResponseDto {
  @ApiProperty({ description: 'Lista de boards', type: [BoardResponseDto] })
  data: BoardResponseDto[];

  @ApiProperty({ description: 'Total de boards' })
  total: number;

  @ApiProperty({ description: 'Página atual' })
  page: number;

  @ApiProperty({ description: 'Tamanho da página' })
  pageSize: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;
}
