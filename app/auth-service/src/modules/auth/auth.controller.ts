import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './use-cases/login/dto/login.dto';
import { LoginUseCase } from './use-cases/login/login.use-case';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate a user and return a JWT token',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(loginDto);
  }
}
