import { CategoriasPermiso } from '@/categorias_permisos/entities/categorias_permiso.entity';
import { Permiso } from '@permisos/entities/permiso.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class PermissionsSeed implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const permissionRepository = dataSource.getRepository(Permiso);
    const categoriaPermisoRepository =
      dataSource.getRepository(CategoriasPermiso);

    const count = await permissionRepository.count();

    if (count > 0) {
      console.log('Los permisos ya tienen datos, omitiendo...');
      return;
    }

    const permisosData = {
      // Roles
      roles: [
        'crear_roles',
        'ver_roles',
        'ver_rol',
        'editar_roles',
        'eliminar_roles',
        'asignar_roles', // Corregido: era 'asginar_roles'
        'agregar_roles',
        'borrar_roles_de_usuario',
      ],

      // Permisos
      permisos: [
        'crear_permisos',
        'ver_permisos',
        'ver_permiso',
        'editar_permisos',
        'eliminar_permisos',
      ],

      // Permisos
      categorias_permisos: [
        'crear_categorias_permisos',
        'ver_categorias_permisos',
        'ver_categorias_permiso',
        'editar_categorias_permisos',
        'eliminar_categorias_permisos',
      ],

      // Usuarios
      usuarios: [
        'crear_usuarios',
        'ver_usuarios',
        'ver_usuario',
        'editar_usuarios',
        'eliminar_usuarios',
        'admin_general',
      ],

      // estudiantes: ['estudiante_general'],
    };

    let totalPermisosCreados = 0;

    for (const [nombreCategoria, listaPermisos] of Object.entries(
      permisosData,
    )) {
      const categoriaPermiso = await categoriaPermisoRepository.findOneBy({
        nombre_categoria: nombreCategoria,
      });

      if (!categoriaPermiso) {
        console.warn(
          `Categoría '${nombreCategoria}' no encontrada, omitiendo permisos de esta categoría`,
        );
        continue;
      }

      for (const nombrePermiso of listaPermisos) {
        await permissionRepository.save({
          nombre_permiso: nombrePermiso,
          categoria_permiso: categoriaPermiso,
        });
        totalPermisosCreados++;
      }
    }

    console.log(`Creados ${totalPermisosCreados} permisos`);
  }
}
