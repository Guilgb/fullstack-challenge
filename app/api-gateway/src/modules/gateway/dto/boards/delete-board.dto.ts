import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteBoardParamsDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  id: string;
}
