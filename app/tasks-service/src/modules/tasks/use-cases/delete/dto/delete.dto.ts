import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteTaskParamsDto {
  @ApiProperty({ description: 'ID da tarefa' })
  @IsString()
  id: string;
}
