import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserParamDto {
  @ApiProperty({
    description: 'ID ou email do usuário a ser recuperado',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString({ message: 'O ID ou email do usuário deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O ID ou email do usuário é obrigatório.' })
  idOrEmail: string;
}
