import { RolesDbValues } from '@/common/enums/roles.enum';
import { Rol } from '@/roles/entities/rol.entity';
import { Permiso } from '@permisos/entities/permiso.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class RolesSeed implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const rolesRepository = dataSource.getRepository(Rol);
    const permissionRepository = dataSource.getRepository(Permiso);

    const count = await rolesRepository.count();

    if (count > 0) {
      console.log('Los roles ya tienen datos, omitiendo...');
      return;
    }

    const permissions = await permissionRepository.find();

    if (permissions.length === 0) {
      console.log('No hay permisos para crear roles, omitiendo...');
      return;
    }

    //EJEMPLO PARA CREAR ROLES CON PERMISOS PREDETERMINADOS
    // const dueñoParkingPermissions: Permiso[] = permissions.filter(
    //   (p) =>
    //     p.nombre_permiso === 'ver_parqueadero' ||
    //     p.nombre_permiso === 'ver_estacionamientos' ||
    //     p.nombre_permiso === 'ver_facturas',
    // );

    const roles: Partial<Rol>[] = [
      {
        nombre_rol: RolesDbValues.ADMIN,
        descripcion_rol: 'Administrador del sistema',
        permisos: permissions,
      },
    ];

    await rolesRepository.save(roles);

    console.log(`Creados ${roles.length} roles`);
  }
}
