import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../auth/decorators';
import { ProxyService } from '../../proxy/services/proxy.service';
import { LoginDto, RefreshTokenDto } from '../dto';

@ApiTags('auth')
@Controller('auth')
export class AuthGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.proxyService.sendToAuthService('auth.login', loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar token de acesso' })
  @ApiResponse({
    status: 200,
    description: 'Token atualizado com sucesso',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token de atualização inválido' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.proxyService.sendToAuthService('auth.refresh', refreshTokenDto);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar token de acesso' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async validateToken(@Body('token') token: string) {
    return this.proxyService.sendToAuthService('auth.validate', { token });
  }
}
