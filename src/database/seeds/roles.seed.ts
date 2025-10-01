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

    // const driverPermissions: Permiso[] = permissions.filter(
    //   (p) =>
    //     p.nombre_permiso === 'ver_rol' ||
    //     p.nombre_permiso === 'ver_permiso' ||
    //     p.nombre_permiso === 'ver_usuario' ||
    //     p.nombre_permiso === 'ver_vehiculo' ||
    //     p.nombre_permiso === 'eliminar_notificaciones',
    // );

    const roles: Partial<Rol>[] = [
      {
        nombre_rol: 'admin',
        descripcion_rol: 'Administrador del sistema',
        permisos: permissions,
      },
      // {
      //   nombre_rol: 'conductor',
      //   descripcion_rol: 'Conductor de vehiculos',
      //   permisos: driverPermissions,
      // },
    ];

    await rolesRepository.save(roles);

    console.log(`Creados ${roles.length} permisos`);
  }
}
