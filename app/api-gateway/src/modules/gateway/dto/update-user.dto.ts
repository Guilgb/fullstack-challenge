import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../auth/enums/roles.enum';
import {
  FIELD_LIMITS,
  SWAGGER_EXAMPLES,
  VALIDATION_MESSAGES,
  VALIDATION_PATTERNS,
} from '../constants/user.validation.constants';

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum UserOrderByFields {
  EMAIL = 'email',
  USERNAME = 'username',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ROLE = 'role',
  IS_EMAIL_VERIFIED = 'isEmailVerified',
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: SWAGGER_EXAMPLES.USER.EMAIL,
    maxLength: FIELD_LIMITS.EMAIL.MAX_LENGTH,
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.GENERAL.INVALID_STRING })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL.INVALID_FORMAT })
  email?: string;

  @ApiProperty({
    description: `Nome de usuário (mínimo ${FIELD_LIMITS.NAME.MIN_LENGTH} caracteres)`,
    example: SWAGGER_EXAMPLES.USER.USERNAME,
    minLength: FIELD_LIMITS.NAME.MIN_LENGTH,
    maxLength: FIELD_LIMITS.NAME.MAX_LENGTH,
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.GENERAL.INVALID_STRING })
  @MinLength(FIELD_LIMITS.NAME.MIN_LENGTH, {
    message: VALIDATION_MESSAGES.USER.USERNAME.MIN_LENGTH,
  })
  @MaxLength(FIELD_LIMITS.NAME.MAX_LENGTH, {
    message: VALIDATION_MESSAGES.USER.USERNAME.MAX_LENGTH,
  })
  username: string;

  @ApiProperty({
    description: `Senha do usuário (mínimo ${FIELD_LIMITS.PASSWORD.MIN_LENGTH} caracteres)`,
    example: SWAGGER_EXAMPLES.USER.PASSWORD,
    minLength: FIELD_LIMITS.PASSWORD.MIN_LENGTH,
    maxLength: FIELD_LIMITS.PASSWORD.MAX_LENGTH,
    format: 'password',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.GENERAL.INVALID_STRING })
  @MinLength(FIELD_LIMITS.PASSWORD.MIN_LENGTH, {
    message: VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH,
  })
  @MaxLength(FIELD_LIMITS.PASSWORD.MAX_LENGTH)
  @Matches(VALIDATION_PATTERNS.STRONG_PASSWORD, {
    message: VALIDATION_MESSAGES.PASSWORD.PATTERN,
  })
  password?: string;

  @ApiProperty({
    description: 'Role do usuário',
    example: SWAGGER_EXAMPLES.ROLES.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: VALIDATION_MESSAGES.GENERAL.INTERNAL_ERROR })
  role?: UserRole;
}
