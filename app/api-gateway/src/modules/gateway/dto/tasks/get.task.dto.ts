import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetTaskParamsDto {
  @ApiProperty({ description: 'ID da tarefa' })
  @IsString()
  id: string;
}

export class TaskResponseDto {
  @ApiProperty({
    description: 'Identificador único da task',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'Título da task',
    example: 'Estudar NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'Descrição da task',
    example: 'Ler a documentação oficial do NestJS e fazer exercícios práticos',
  })
  description: string;

  @ApiProperty({
    description: 'Prioridade da task',
    example: 'Alta',
  })
  priority: string;

  @ApiProperty({
    description: 'Data limite para conclusão da task',
    example: '2023-12-31T23:59:59Z',
  })
  deadline: Date;

  @ApiProperty({
    description: 'Data de criação da task',
    example: '2023-10-01T12:34:56Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da task',
    example: '2023-10-02T15:20:30Z',
  })
  updatedAt: Date;
}
