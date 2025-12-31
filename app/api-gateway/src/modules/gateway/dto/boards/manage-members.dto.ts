import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum BoardRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class AddMemberParamsDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  boardId: string;
}

export class AddMemberInputDto {
  @ApiProperty({ description: 'ID do usuário a ser adicionado' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Role do membro',
    enum: BoardRoleEnum,
    default: BoardRoleEnum.MEMBER,
  })
  @IsOptional()
  @IsEnum(BoardRoleEnum)
  role?: BoardRoleEnum;
}

export class AddMemberOutputDto {
  @ApiProperty({ description: 'ID do membro' })
  id: string;

  @ApiProperty({ description: 'ID do board' })
  boardId: string;

  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ description: 'Role do membro', enum: BoardRoleEnum })
  role: BoardRoleEnum;

  @ApiProperty({ description: 'Data de entrada' })
  joinedAt: Date;
}
