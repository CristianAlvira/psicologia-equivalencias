import { Usuario } from '../../usuarios/entities/usuario.entity';

export const getFullName = (user: Usuario) =>
  `${user.nombres} ${user.apellidos}`.trim();
