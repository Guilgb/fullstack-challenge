import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

export enum BoardRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
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
