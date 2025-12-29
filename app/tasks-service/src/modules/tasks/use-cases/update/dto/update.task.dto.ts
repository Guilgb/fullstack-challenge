import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { priorityEnum } from '@shared/modules/database/entities/tasks.entity';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTaskParamsDto {
  @ApiProperty({ description: 'ID da tarefa' })
  @IsString()
  id: string;
}
export class UpdateTaskInputDto {
  @ApiProperty({ description: 'Título da tarefa' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição da tarefa' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Prioridade da tarefa' })
  @IsOptional()
  @IsEnum(priorityEnum)
  priority?: priorityEnum;

  @ApiPropertyOptional({
    description: 'Prazo da tarefa',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  deadline?: Date;

  @ApiPropertyOptional({ description: 'ID do board' })
  @IsOptional()
  @IsUUID()
  boardId?: string;
}

export class UpdateTaskOutputDto {
  @ApiProperty({ description: 'ID da tarefa atualizada' })
  id: string;

  @ApiProperty({ description: 'Título da tarefa' })
  title: string;

  @ApiPropertyOptional({ description: 'Descrição da tarefa' })
  description?: string;

  @ApiPropertyOptional({ description: 'Prioridade da tarefa' })
  priority: priorityEnum;

  @ApiPropertyOptional({
    description: 'Prazo da tarefa',
    type: String,
    format: 'date-time',
  })
  deadline?: Date;

  @ApiProperty({
    description: 'Data de criação',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
