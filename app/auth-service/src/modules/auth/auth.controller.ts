import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './use-cases/login/dto/login.dto';
import { LoginUseCase } from './use-cases/login/login.use-case';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './use-cases/refresh-token/dto/refresh-token.dto';
import { RefreshTokenUseCase } from './use-cases/refresh-token/refresh-token.use-case';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('login')
  @MessagePattern('auth.login')
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

  @MessagePattern('auth.refreshToken')
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Generate a new access token using a refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.refreshTokenUseCase.execute(refreshTokenDto);
  }
}
