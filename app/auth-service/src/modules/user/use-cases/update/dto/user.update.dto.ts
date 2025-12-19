import {
  FIELD_LIMITS,
  SWAGGER_EXAMPLES,
  VALIDATION_MESSAGES,
  VALIDATION_PATTERNS,
} from '@modules/user/constants/validation.constants';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

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
  @IsEnum(UserRole, { message: VALIDATION_MESSAGES.ROLE.INVALID_UUID })
  role?: UserRole;
}

export class UpdatedUserResponseDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: SWAGGER_EXAMPLES.USER.ID,
  })
  id: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: SWAGGER_EXAMPLES.USER.EMAIL,
  })
  email: string;

  @ApiProperty({
    description: 'Nome de usuário',
    example: SWAGGER_EXAMPLES.USER.USERNAME,
  })
  username: string;

  @ApiProperty({
    description: 'Indica se o e-mail do usuário foi verificado',
    example: false,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Role do usuário',
    example: SWAGGER_EXAMPLES.ROLES.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: SWAGGER_EXAMPLES.DATES.CREATED_AT,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do usuário',
    example: SWAGGER_EXAMPLES.DATES.UPDATED_AT,
  })
  updatedAt: Date;
}
