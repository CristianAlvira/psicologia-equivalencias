import { CategoriasPermiso } from '@/categorias_permisos/entities/categorias_permiso.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class PermissionsCategoriesSeed implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const permissionCategoryRepository =
      dataSource.getRepository(CategoriasPermiso);

    const count = await permissionCategoryRepository.count();

    if (count > 0) {
      console.log('Las categorías de permisos ya tienen datos, omitiendo...');
      return;
    }

    const categorias = [
      // Roles
      'roles',

      // Permisos
      'permisos',

      // Cateogorias de Permisos
      'categorias_permisos',

      // Usuarios
      'usuarios',
    ];

    const mappedCategories = categorias.map((categoria) => ({
      nombre_categoria: categoria,
    }));

    await permissionCategoryRepository.insert(mappedCategories);

    console.log(`Creados ${categorias.length} cateogorias`);
  }
}
