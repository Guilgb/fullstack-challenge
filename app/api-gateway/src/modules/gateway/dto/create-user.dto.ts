import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  FIELD_LIMITS,
  SWAGGER_EXAMPLES,
  VALIDATION_MESSAGES,
  VALIDATION_PATTERNS,
} from '../constants/user.validation.constants';

export class CreateUserDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: SWAGGER_EXAMPLES.USER.EMAIL,
    maxLength: FIELD_LIMITS.EMAIL.MAX_LENGTH,
  })
  @IsString({ message: VALIDATION_MESSAGES.GENERAL.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.EMAIL.REQUIRED })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL.INVALID_FORMAT })
  email: string;

  @ApiProperty({
    description: `Senha do usuário (mínimo ${FIELD_LIMITS.PASSWORD.MIN_LENGTH} caracteres)`,
    example: SWAGGER_EXAMPLES.USER.PASSWORD,
    minLength: FIELD_LIMITS.PASSWORD.MIN_LENGTH,
    maxLength: FIELD_LIMITS.PASSWORD.MAX_LENGTH,
    format: 'password',
  })
  @IsString({ message: VALIDATION_MESSAGES.GENERAL.INVALID_STRING })
  @MinLength(FIELD_LIMITS.PASSWORD.MIN_LENGTH, {
    message: VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH,
  })
  @MaxLength(FIELD_LIMITS.PASSWORD.MAX_LENGTH)
  @Matches(VALIDATION_PATTERNS.STRONG_PASSWORD, {
    message: VALIDATION_MESSAGES.PASSWORD.PATTERN,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.PASSWORD.REQUIRED })
  password: string;

  @ApiProperty({
    description: 'Nome de usuário',
    example: SWAGGER_EXAMPLES.USER.USERNAME,
  })
  @IsString({ message: VALIDATION_MESSAGES.GENERAL.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.USER.USERNAME.REQUIRED })
  username: string;
}
