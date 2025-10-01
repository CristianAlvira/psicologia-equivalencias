import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as Usuario;
  },
);
