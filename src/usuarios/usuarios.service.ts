import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
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
    // Validar que el usuario acepta el tratamiento de datos
    if (!createUsuarioDto.acepta_tratamiento_datos) {
      throw new BadRequestException(
        'Debe aceptar las políticas de tratamiento de datos para crear una cuenta',
      );
    }

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
      // Registrar consentimiento si se proporciona
      fecha_consentimiento: createUsuarioDto.acepta_tratamiento_datos
        ? new Date()
        : undefined,
    });

    const savedUser = await this.usuarioRepository.save(usuario);
    const { password, ...savedUserWithoutPassword } = savedUser;
    void password;

    return savedUserWithoutPassword;
  }

  async createEstudiante(createEstudianteDto: CreateEstudianteDto) {
    // Validar que el estudiante acepta el tratamiento de datos (OBLIGATORIO)
    if (!createEstudianteDto.acepta_tratamiento_datos) {
      throw new BadRequestException(
        'Los estudiantes deben aceptar obligatoriamente las políticas de tratamiento de datos sensibles',
      );
    }

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

      // Si existe pero no tiene equivalencias, lanzar excepción también
      // throw new ConflictException(
      //   `El estudiante con código ${createEstudianteDto.codigo_estudiantil} ya está registrado en el sistema`,
      // );
      return {
        message: `El estudiante con código ${createEstudianteDto.codigo_estudiantil} ya está registrado en el sistema y no tiene equivalencias`,
        estudiante_id: studentExists.id,
      };
    }

    // Buscar el rol de estudiante por defecto (ID 2)
    const rolEstudiante = await this.rolRepository.findOne({
      where: { id: 3 },
    });

    const estudianteData = {
      nombres: createEstudianteDto.nombres,
      apellidos: createEstudianteDto.apellidos,
      codigo_estudiantil: createEstudianteDto.codigo_estudiantil,
      estado: createEstudianteDto.estado ?? true,
      roles: rolEstudiante ? [rolEstudiante] : [],
      // Campos de consentimiento (obligatorios para estudiantes)
      acepta_tratamiento_datos: createEstudianteDto.acepta_tratamiento_datos,
      fecha_consentimiento: createEstudianteDto.acepta_tratamiento_datos
        ? new Date()
        : undefined,
      version_politicas: createEstudianteDto.version_politicas || '1.0.0',
      // No incluir password ni email para estudiantes
    };

    const estudiante = this.usuarioRepository.create(estudianteData);
    return await this.usuarioRepository.save(estudiante);
  }

  /**
   * Actualiza la información de consentimiento de un usuario con datos de auditoría
   */
  async actualizarConsentimientoConAuditoria(
    usuarioId: number,
    ipAddress: string,
    userAgent: string,
  ) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.ip_consentimiento = ipAddress;
    usuario.user_agent_consentimiento = userAgent;

    return await this.usuarioRepository.save(usuario);
  }

  async findAll(filterDto: FilterUsuariosQueryDto) {
    const {
      limit = 10,
      offset = 0,
      estado,
      estudiante,
      codigo_estudiantil,
      tiene_equivalencias,
      rol_id,
    } = filterDto;
    const skip = offset;

    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .skip(skip);

    if (limit !== -1) {
      queryBuilder.take(limit);
    }

    if (estado !== undefined) {
      queryBuilder.andWhere('usuario.estado = :estado', { estado });
    }

    if (estudiante) {
      queryBuilder.andWhere('usuario.email IS NULL');
    }

    if (codigo_estudiantil) {
      queryBuilder.andWhere(
        'usuario.codigo_estudiantil ILIKE :codigo_estudiantil',
        {
          codigo_estudiantil: `%${codigo_estudiantil}%`,
        },
      );
    }

    // Filtro por rol
    if (rol_id !== undefined) {
      queryBuilder.andWhere('roles.id = :rol_id', { rol_id });
    }

    // Siempre hacer LEFT JOIN para obtener información de equivalencias
    queryBuilder
      .leftJoin(
        'resultados_homologacion',
        'rh_info',
        'rh_info.estudiante_id = usuario.id',
      )
      .addSelect('COUNT(DISTINCT rh_info.id) as equivalencias_count')
      .groupBy(
        'usuario.id, usuario.nombres, usuario.apellidos, usuario.email, usuario.estado, usuario.codigo_estudiantil, usuario.created_at, usuario.updated_at, roles.id, roles.nombre_rol, roles.descripcion_rol, roles.created_at, roles.updated_at',
      );

    if (tiene_equivalencias !== undefined) {
      if (tiene_equivalencias) {
        queryBuilder.having('COUNT(DISTINCT rh_info.id) > 0');
      }
      // Si tiene_equivalencias es false, no agregamos ningún filtro (trae todos)
    }

    const result = await queryBuilder.getRawAndEntities();
    const usuarios = result.entities;
    const rawResults = result.raw;

    // Obtener el total sin filtros de equivalencias para el conteo correcto
    const totalQueryBuilder =
      this.usuarioRepository.createQueryBuilder('usuario');

    if (estado !== undefined) {
      totalQueryBuilder.andWhere('usuario.estado = :estado', { estado });
    }

    if (estudiante) {
      totalQueryBuilder.andWhere('usuario.email IS NULL');
    }

    if (codigo_estudiantil) {
      totalQueryBuilder.andWhere(
        'usuario.codigo_estudiantil ILIKE :codigo_estudiantil',
        {
          codigo_estudiantil: `%${codigo_estudiantil}%`,
        },
      );
    }

    // Filtro por rol en el conteo total
    if (rol_id !== undefined) {
      totalQueryBuilder
        .leftJoin('usuario.roles', 'roles_total')
        .andWhere('roles_total.id = :rol_id', { rol_id });
    }

    const total = await totalQueryBuilder.getCount();

    return {
      data: usuarios.map(({ password, ...usuario }, index) => {
        void password;
        const equivalenciasCount = parseInt(
          rawResults[index]?.equivalencias_count || '0',
        );
        return {
          ...usuario,
          tiene_equivalencia: equivalenciasCount > 0,
        };
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

  async findOneByCodigoEstudiante(codigo_estudiantil: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { codigo_estudiantil },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con código estudiantil ${codigo_estudiantil} no encontrado`,
      );
    }

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
