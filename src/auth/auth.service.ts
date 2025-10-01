import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsuarioTokenFcm } from './entities/usuario_token_fcm.entity';
import { CreateUsuarioTokenFcmDto } from './dto/create-usuario-token-fcm.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UsuarioTokenFcm)
    private usuarioTokenFcmRepository: Repository<UsuarioTokenFcm>,
  ) {}

  async validateUser(credential: string, password: string): Promise<any> {
    const user = await this.usuarioRepository.findOne({
      where: [{ email: credential }, { num_celular: credential }],
      relations: ['roles', 'roles.permisos'],
      select: ['id', 'nombres', 'email', 'password', 'estado'],
    });

    if (!user) return null;

    if (!user?.estado)
      throw new UnauthorizedException(
        'La cuenta no esta activa, por favor contacte al administrador',
      );

    if (await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    user: Usuario,
    remember_me: boolean = false,
    ip_address?: string,
  ): Promise<LoginResponseDto> {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles?.map((r) => r.nombre_rol) || [],
      permisos: this.extractPermisos(user.roles),
    };

    const accessTokenExpiry = remember_me ? '1h' : '15m';
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: accessTokenExpiry,
    });

    const refreshTokenExpiry = remember_me ? '90d' : '30d';
    const refreshPayload = { sub: user.id, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshTokenExpiry,
    });

    await this.saveRefreshToken(user.id, refreshToken, remember_me, ip_address);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: remember_me ? 3600 : 900, // segundos
      token_type: 'Bearer',
      user: {
        id: user.id,
        nombres: user.nombres,
        email: user.email,
        roles: payload.roles,
        permisos: payload.permisos,
      },
    };
  }

  async getUserWithPermissions(userId: number) {
    const user = await this.usuarioRepository.findOne({
      where: { id: userId, estado: true },
      relations: ['roles', 'roles.permisos'],
    });

    if (!user) return null;

    return {
      ...user,
      permisos: this.extractPermisos(user.roles),
    };
  }

  private extractPermisos(roles: any[]): string[] {
    if (!roles) return [];

    const permisos = new Set<string>();
    roles.forEach((rol) => {
      if (rol.permisos) {
        rol.permisos.forEach((permiso) => {
          permisos.add(permiso.nombre_permiso);
        });
      }
    });

    return Array.from(permisos);
  }

  private async saveRefreshToken(
    user_id: number,
    token: string,
    remember_me: boolean,
    ip_address?: string,
  ): Promise<void> {
    await this.cleanExpiredTokens(user_id);

    // Se acordó no implementar el límite de sesiones activas
    // await this.limitActiveSessions(user_id, 5);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (remember_me ? 90 : 30));

    const refreshTokenEntity = this.refreshTokenRepository.create({
      user_id,
      token,
      ip_address,
      expires_at: expiresAt,
      remember_me,
      is_active: true,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      const storedTokens = await this.refreshTokenRepository.find({
        where: {
          user_id: payload.sub,
          is_active: true,
          expires_at: MoreThan(new Date()),
        },
        relations: ['usuario', 'usuario.roles', 'usuario.roles.permisos'],
      });

      let validToken: RefreshToken | null = null;
      for (const stored of storedTokens) {
        if (refreshToken === stored.token) {
          validToken = stored;
          break;
        }
      }

      if (!validToken || validToken.expires_at < new Date()) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      if (!validToken.usuario.estado) {
        await this.revokeRefreshToken(validToken.id);
        throw new UnauthorizedException('Usuario inactivo');
      }

      const user = validToken.usuario;
      const newPayload = {
        email: user.email,
        sub: user.id,
        roles: user.roles?.map((r) => r.nombre_rol) || [],
        permisos: this.extractPermisos(user.roles),
      };

      const accessTokenExpiry = validToken.remember_me ? '1h' : '15m';
      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: accessTokenExpiry,
      });

      const newRefreshTokenExpiry = validToken.remember_me ? '90d' : '30d';
      const newRefreshPayload = { sub: user.id, type: 'refresh' };
      const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: newRefreshTokenExpiry,
      });

      await this.revokeRefreshToken(validToken.id);
      await this.saveRefreshToken(
        user.id,
        newRefreshToken,
        validToken.remember_me,
        validToken.ip_address,
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: validToken.remember_me ? 3600 : 900,
        token_type: 'Bearer',
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(
    user_id: number,
    refresh_token?: string,
    token_fcm?: string,
  ): Promise<void> {
    if (refresh_token) {
      const storedTokens = await this.refreshTokenRepository.find({
        where: { user_id, is_active: true },
      });

      for (const stored of storedTokens) {
        if (refresh_token === stored.token) {
          await this.revokeRefreshToken(stored.id);
          break;
        }
      }
    } else {
      // Cerrar todas las sesiones
      await this.refreshTokenRepository.update(
        { user_id, is_active: true },
        { is_active: false },
      );
    }

    //Desactivar/eliminar token FCM específico (si se envió)
    if (token_fcm) {
      await this.usuarioTokenFcmRepository.delete({
        usuario: { id: user_id },
        token_fcm,
      });
    }
  }

  async logoutAllDevices(user_id: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { user_id, is_active: true },
      { is_active: false },
    );

    // Eliminar todos los tokens FCM del usuario
    await this.usuarioTokenFcmRepository.delete({
      usuario: { id: user_id },
    });
  }

  async getActiveSessions(user_id: number) {
    return await this.refreshTokenRepository.find({
      where: { user_id, is_active: true },
      select: ['id', 'ip_address', 'created_at', 'remember_me'],
      order: { created_at: 'DESC' },
    });
  }

  // helpers
  private async cleanExpiredTokens(user_id: number): Promise<void> {
    await this.refreshTokenRepository.delete({
      user_id,
      expires_at: LessThan(new Date()),
    });
  }

  private async limitActiveSessions(
    user_id: number,
    max_sessions: number,
  ): Promise<void> {
    const activeSessions = await this.refreshTokenRepository.find({
      where: { user_id, is_active: true },
      order: { created_at: 'DESC' },
    });

    if (activeSessions.length >= max_sessions) {
      // Este código básicamente revisa el array de sesiones activas y revoca el token de las sesiones anteriores de acuerdo
      // al número nuevo de sesiones iniciadas.
      // const sessionsToRevoke = activeSessions.slice(max_sessions - 1);
      // const idsToRevoke = sessionsToRevoke.map((s) => s.id);
      // await this.refreshTokenRepository.update(
      //   { id: In(idsToRevoke) },
      //   { is_active: false },
      // );
    }
  }

  private async revokeRefreshToken(token_id: number): Promise<void> {
    await this.refreshTokenRepository.update(token_id, { is_active: false });
  }

  async registrarTokenFcm(usuario: Usuario, dto: CreateUsuarioTokenFcmDto) {
    const existente = await this.usuarioTokenFcmRepository.findOne({
      where: { token_fcm: dto.token_fcm },
      relations: ['usuario'],
    });

    if (existente) {
      if (existente.usuario.id === usuario.id) {
        // Reactivar si era inactivo
        if (!existente.is_active) {
          existente.is_active = true;
          return this.usuarioTokenFcmRepository.save(existente);
        }
        return existente; // Ya existe y activo
      }

      // Token duplicado por otro usuario (raro), opcional: ignorar o eliminar
      return existente;
    }

    const nuevo = this.usuarioTokenFcmRepository.create({
      usuario,
      token_fcm: dto.token_fcm,
      is_active: true,
    });

    return this.usuarioTokenFcmRepository.save(nuevo);
  }

  //--------------------------------------------------------------------------
}
