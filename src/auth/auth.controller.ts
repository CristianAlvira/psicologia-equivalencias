import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Usuario } from '@/usuarios/entities/usuario.entity';
import { CreateUsuarioTokenFcmDto } from './dto/create-usuario-token-fcm.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  async login(
    @Body('remember_me') remember_me: boolean = false,
    @Ip() ip: string,
    @CurrentUser() user: Usuario,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(user, remember_me, ip);
  }

  @ApiBody({ type: RefreshTokenDto })
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return await this.authService.refreshAccessToken(refreshDto.refresh_token);
  }

  @ApiBearerAuth()
  @ApiBody({ type: RefreshTokenDto, required: false })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() user: Usuario,
    @Body() body: { refresh_token?: string; token_fcm?: string } = {},
  ) {
    await this.authService.logout(user.id, body.refresh_token);
    return { message: 'Sesión cerrada exitosamente' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(200)
  async logoutAll(@CurrentUser() user: Usuario) {
    await this.authService.logoutAllDevices(user.id);
    return { message: 'Todas las sesiones han sido cerradas' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser() user: Usuario) {
    const sessions = await this.authService.getActiveSessions(user.id);
    return { sessions };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('token-fcm')
  async registerFcmToken(
    @CurrentUser() user: Usuario,
    @Body() dto: CreateUsuarioTokenFcmDto,
  ) {
    return await this.authService.registrarTokenFcm(user, dto);
  }
}
