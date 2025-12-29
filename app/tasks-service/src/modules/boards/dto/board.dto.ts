import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardRoleEnum } from '@shared/modules/database/entities/board-member.entity';
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class BoardMemberDto {
  @ApiProperty({ description: 'ID do membro' })
  id: string;

  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ description: 'Role do membro', enum: BoardRoleEnum })
  role: BoardRoleEnum;

  @ApiProperty({ description: 'Data de entrada' })
  joinedAt: Date;
}

export class RemoveMemberParamsDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  boardId: string;

  @ApiProperty({ description: 'ID do usuário a ser removido' })
  @IsUUID()
  userId: string;
}

export class UpdateMemberRoleParamsDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  boardId: string;

  @ApiProperty({ description: 'ID do usuário' })
  @IsUUID()
  userId: string;
}

export class UpdateMemberRoleInputDto {
  @ApiProperty({ description: 'Nova role do membro', enum: BoardRoleEnum })
  @IsEnum(BoardRoleEnum)
  role: BoardRoleEnum;
}

export class InviteMembersInputDto {
  @ApiProperty({ description: 'IDs dos usuários a serem convidados' })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiPropertyOptional({
    description: 'Role dos membros',
    enum: BoardRoleEnum,
    default: BoardRoleEnum.MEMBER,
  })
  @IsOptional()
  @IsEnum(BoardRoleEnum)
  role?: BoardRoleEnum;
}
