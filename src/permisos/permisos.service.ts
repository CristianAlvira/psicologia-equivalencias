import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permiso } from './entities/permiso.entity';
import { In, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CategoriasPermisosService } from '@/categorias_permisos/categorias_permisos.service';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
    private readonly categoriasPermisosService: CategoriasPermisosService,
  ) {}
  async create(createPermisoDto: CreatePermisoDto) {
    const categoria = await this.categoriasPermisosService.findOne(
      createPermisoDto.categoria_permiso_id,
    );
    const permission = this.permisoRepository.create({
      ...createPermisoDto,
      categoria_permiso: categoria,
    });

    const savedPermission = await this.permisoRepository.save(permission);

    return await this.permisoRepository.findOne({
      where: { id: savedPermission.id },
      relations: ['categoria_permiso'],
      select: {
        id: true,
        nombre_permiso: true,
        categoria_permiso: {
          id: true,
          nombre_categoria: true,
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    if (limit === -1) {
      return await this.permisoRepository.find({
        relations: ['categoria_permiso'],
      });
    }

    return await this.permisoRepository.find({
      take: limit,
      skip: offset,
      relations: ['categoria_permiso'],
    });
  }

  async findMany(ids: number[]) {
    const permissions = await this.permisoRepository.find({
      where: { id: In(ids) },
    });

    if (permissions.length !== ids.length) {
      const foundIds = permissions.map((permission) => permission.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Los siguientes IDs no existen: ${missingIds.join(', ')}`,
      );
    }

    return permissions;
  }

  update(id: number, updatePermisoDto: UpdatePermisoDto) {
    return `This action updates a #${id} permiso`;
  }

  async remove(id: number) {
    // Usar el repositorio para encontrar el permiso
    const permiso = await this.permisoRepository.findOne({
      where: { id },
      relations: ['roles'], // Si necesitas obtener los roles relacionados con el permiso
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    // Verificar si el permiso está siendo utilizado en algún rol u otras relaciones
    if (permiso.roles && permiso.roles.length > 0) {
      throw new BadRequestException(
        `El permiso está siendo utilizado por ${permiso.roles.length} rol(es). No se puede eliminar.`,
      );
    }

    await this.permisoRepository.remove(permiso);

    return {
      message: `Permiso con ID ${id} eliminado correctamente.`,
    };
  }
}
