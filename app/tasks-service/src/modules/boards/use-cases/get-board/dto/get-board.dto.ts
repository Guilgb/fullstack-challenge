import { BoardMemberDto } from '@modules/boards/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetBoardParamsDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  id: string;
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

  @ApiProperty({ description: 'Membros do board', type: [BoardMemberDto] })
  members: BoardMemberDto[];

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
