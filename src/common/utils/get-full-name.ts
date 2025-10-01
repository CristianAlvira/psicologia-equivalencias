import { Usuario } from '../../usuarios/entities/usuario.entity';

export const getFullName = (user: Usuario) =>
  `${user.nombres} ${user.primer_apellido} ${user.segundo_apellido ?? ''}`.trim();
