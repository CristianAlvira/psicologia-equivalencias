import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Rol } from '@/roles/entities/rol.entity';
import { FilterUsuariosQueryDto } from './dto/filter-usuarios-query.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateEstudianteDto } from './dto/create-estudiante';
import { EquivalenciasService } from '@/equivalencias/equivalencias.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    private readonly equivalenciasService: EquivalenciasService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const hashedPassword = createUsuarioDto.password
      ? bcrypt.hashSync(createUsuarioDto.password, 10)
      : undefined;

    // Verificar si el email ya está registrado
    const emailExists = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
    });

    if (emailExists) {
      throw new ConflictException(
        `El email ${createUsuarioDto.email} ya está en uso`,
      );
    }

    // Buscar las entidades de roles correspondientes para asignarlas
    const roles =
      createUsuarioDto.roles && createUsuarioDto.roles.length > 0
        ? await this.rolRepository.find({
            where: { id: In(createUsuarioDto.roles) },
          })
        : [];

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
      roles: roles,
    });

    const savedUser = await this.usuarioRepository.save(usuario);
    const { password, ...savedUserWithoutPassword } = savedUser;
    void password;

    return savedUserWithoutPassword;
  }

  async createEstudiante(createEstudianteDto: CreateEstudianteDto) {
    // Verificar si ya existe un usuario con ese código estudiantil
    const studentExists = await this.usuarioRepository.findOne({
      where: { codigo_estudiantil: createEstudianteDto.codigo_estudiantil },
    });

    if (studentExists) {
      // Si el estudiante ya existe, verificar si tiene equivalencias
      const tieneEquivalencias =
        await this.equivalenciasService.estudianteTieneEquivalencias(
          studentExists.id,
        );

      if (tieneEquivalencias) {
        // throw new ConflictException(
        //   `El estudiante con código ${createEstudianteDto.codigo_estudiantil} ya tiene equivalencias registradas`,
        // );
        return {
          message: `El estudiante con código ${createEstudianteDto.codigo_estudiantil} ya tiene equivalencias registradas`,
          estudiante_id: studentExists.id,
        };
      }

      // Si existe pero no tiene equivalencias, devolver el estudiante existente
      return studentExists;
    }

    // Buscar el rol de estudiante por defecto (ID 2)
    const rolEstudiante = await this.rolRepository.findOne({
      where: { id: 2 },
    });

    const estudianteData = {
      nombres: createEstudianteDto.nombres,
      apellidos: createEstudianteDto.apellidos,
      codigo_estudiantil: createEstudianteDto.codigo_estudiantil,
      estado: createEstudianteDto.estado ?? true,
      roles: rolEstudiante ? [rolEstudiante] : [],
      // No incluir password ni email para estudiantes
    };

    const estudiante = this.usuarioRepository.create(estudianteData);
    return await this.usuarioRepository.save(estudiante);
  }

  async findAll(filterDto: FilterUsuariosQueryDto) {
    const { limit = 10, offset = 0, estado, rol } = filterDto;
    const skip = offset;

    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .skip(skip);

    if (limit !== -1) {
      queryBuilder.take(limit);
    }

    if (rol) {
      queryBuilder.andWhere('roles.nombre_rol ILIKE :rol', { rol: `%${rol}%` });
    }

    if (estado !== undefined) {
      queryBuilder.andWhere('usuario.isActive = :estado', { estado });
    }

    const [usuarios, total] = await queryBuilder.getManyAndCount();

    return {
      data: usuarios.map(({ password, ...usuario }) => {
        void password;
        return usuario;
      }),
      total,
      limit,
      offset,
      totalPages: limit !== -1 ? Math.ceil(total / limit) : 1,
    };
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const { password, ...usuarioWithoutPassword } = usuario;
    void password;
    return usuarioWithoutPassword;
  }

  async findOneByEmail(email: string) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .where('usuario.email = :email', { email })
      .getOne();

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se están actualizando los roles
    if (updateUsuarioDto.roles) {
      const nuevosRoles = await this.rolRepository.find({
        where: { id: In(updateUsuarioDto.roles) },
      });
      usuario.roles = nuevosRoles;
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = bcrypt.hashSync(
        updateUsuarioDto.password,
        10,
      );
    }

    Object.assign(usuario, updateUsuarioDto);
    await this.usuarioRepository.save(usuario);

    const { password, ...updatedUserWithoutPassword } = usuario;
    void password;
    return updatedUserWithoutPassword;
  }

  async remove(id: number) {
    const user = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuarioRepository.remove(user);
    return { message: 'Usuario eliminado correctamente' };
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Hashear la nueva contraseña
    const hashedNewPassword = bcrypt.hashSync(changePasswordDto.password, 10);

    // Actualizar la contraseña
    await this.usuarioRepository.update(id, {
      password: hashedNewPassword,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
