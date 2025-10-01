import { Rol } from '@/roles/entities/rol.entity';
import { Usuario } from '@/usuarios/entities/usuario.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class UserAdminSeed implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(Usuario);
    const roleRepository = dataSource.getRepository(Rol);

    const validation = await userRepository.findOneBy({
      email: 'admin@admin.com',
    });

    if (validation) {
      console.log('El usuario administrador ya existe, omitiendo...');
      return;
    }

    const roleAdmin = await roleRepository.findOneBy({
      nombre_rol: 'administrador',
    });

    if (!roleAdmin) {
      console.log('No se encontro el rol administrador, omitiendo...');
      return;
    }

    const usuario: Partial<Usuario> = {
      email: 'admin@admin.com',
      password: bcrypt.hashSync('admin', 10),
      roles: [roleAdmin],
      nombres: 'Administrador',
      apellidos: 'Admin',
      estado: true,
    };

    await userRepository.save(usuario);

    console.log(`Se ha insertado el rol admin base`);
  }
}
