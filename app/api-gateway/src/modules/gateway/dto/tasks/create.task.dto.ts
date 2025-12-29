import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum priorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskInputDto {
  @ApiProperty({ description: 'Título da tarefa' })
  @IsString()
  title: string;

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

  @ApiPropertyOptional({ description: 'ID do usuário atribuído à tarefa' })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'ID do board' })
  @IsOptional()
  @IsUUID()
  boardId?: string;
}

export class CreateTaskOutputDto {
  @ApiProperty({ description: 'ID da tarefa criada' })
  id: string;

  @ApiProperty({ description: 'Título da tarefa' })
  title: string;

  @ApiPropertyOptional({ description: 'Descrição da tarefa' })
  description?: string;

  @ApiPropertyOptional({ description: 'Prioridade da tarefa' })
  priority?: priorityEnum;

  @ApiPropertyOptional({
    description: 'Prazo da tarefa',
    type: String,
    format: 'date-time',
  })
  deadline?: Date;

  @ApiPropertyOptional({ description: 'ID do board' })
  boardId?: string;

  @ApiPropertyOptional({ description: 'ID do usuário atribuído à tarefa' })
  assignedTo?: string;

  @ApiProperty({ description: 'ID do criador da tarefa' })
  createdBy: string;

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
