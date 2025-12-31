import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RemoveMemberParamsDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  boardId: string;

  @ApiProperty({ description: 'ID do usuário a ser removido' })
  @IsUUID()
  userId: string;
}
