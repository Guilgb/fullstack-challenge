import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardRoleEnum } from '@shared/modules/database/entities/board-member.entity';
import { IsUUID } from 'class-validator';

export class GetBoardParamsDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  id: string;
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
