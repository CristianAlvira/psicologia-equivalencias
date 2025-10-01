import { Rol } from '@/roles/entities/rol.entity';
import { Usuario } from '@/usuarios/entities/usuario.entity';
import { TipoDocumento } from '@/usuarios/enums/tipo-documento.enum';
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
      primer_apellido: 'Admin',
      num_celular: '1234567890',
      num_documento: '1234567890',
      estado: true,
      tipo_documento: TipoDocumento.CC,
    };

    await userRepository.save(usuario);

    console.log(`Se ha insertado el rol admin base`);
  }
}