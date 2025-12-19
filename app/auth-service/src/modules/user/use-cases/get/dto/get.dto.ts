import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserInputDto {
  @ApiProperty({
    description: 'ID ou email do usuário a ser recuperado',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString({ message: 'O ID ou email do usuário deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O ID ou email do usuário é obrigatório.' })
  idOrEmail: string;
}

export class GetUserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome de usuário',
    example: 'joao_silva',
  })
  username: string;

  @ApiProperty({
    description: 'Role do usuário',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Email verificado',
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2025-12-19T13:50:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do usuário',
    example: '2025-12-20T10:30:00.000Z',
  })
  updatedAt: Date;
}
