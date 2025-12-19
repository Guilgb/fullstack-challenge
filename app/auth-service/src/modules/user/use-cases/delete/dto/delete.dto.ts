import {
  SWAGGER_EXAMPLES,
  VALIDATION_MESSAGES,
} from '@modules/user/constants/validation.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUserInputDto {
  @ApiProperty({
    description: 'ID ou email do usuário a ser deletado',
    example: SWAGGER_EXAMPLES.USER.ID,
  })
  @IsString({ message: VALIDATION_MESSAGES.GENERAL.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.USER.ID_OR_EMAIL.REQUIRED })
  idOrEmail: string;
}
