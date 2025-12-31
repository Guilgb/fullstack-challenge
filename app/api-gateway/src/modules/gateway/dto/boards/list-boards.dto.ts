import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export enum BoardRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class GetBoardMemberDto {
  @ApiProperty({ description: 'ID do membro' })
  id: string;

  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ description: 'Username do usuário' })
  username: string;

  @ApiProperty({ description: 'Role do membro', enum: BoardRoleEnum })
  role: BoardRoleEnum;

  @ApiProperty({ description: 'Data de entrada' })
  joinedAt: Date;
}
export class BoardResponseDto {
  @ApiProperty({ description: 'ID do board' })
  id: string;

  @ApiProperty({ description: 'Nome do board' })
  name: string;

  @ApiPropertyOptional({ description: 'Descrição do board' })
  description?: string;

  @ApiProperty({ description: 'ID do proprietário' })
  ownerId: string;

  @ApiProperty({ description: 'Membros do board', type: [GetBoardMemberDto] })
  members: GetBoardMemberDto[];

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

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
