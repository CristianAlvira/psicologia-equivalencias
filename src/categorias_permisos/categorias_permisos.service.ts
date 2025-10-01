import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoriasPermisoDto } from './dto/create-categorias_permiso.dto';
import { UpdateCategoriasPermisoDto } from './dto/update-categorias_permiso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriasPermiso } from './entities/categorias_permiso.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class CategoriasPermisosService {
  constructor(
    @InjectRepository(CategoriasPermiso)
    private readonly categoriasPermisoRepository: Repository<CategoriasPermiso>,
  ) {}
  async create(createCategoriasPermisoDto: CreateCategoriasPermisoDto) {
    const categoria = this.categoriasPermisoRepository.create(
      createCategoriasPermisoDto,
    );
    return await this.categoriasPermisoRepository.save(categoria);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    if (limit === -1) {
      return await this.categoriasPermisoRepository.find();
    }

    return await this.categoriasPermisoRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: number) {
    const categoria = await this.categoriasPermisoRepository.findOne({
      where: { id },
      relations: ['permisos'],
    });

    if (!categoria)
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);

    return categoria;
  }

  async update(
    id: number,
    updateCategoriasPermisoDto: UpdateCategoriasPermisoDto,
  ) {
    const categoria = await this.categoriasPermisoRepository.preload({
      id,
      ...updateCategoriasPermisoDto,
    });

    if (!categoria)
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);

    return await this.categoriasPermisoRepository.save(categoria);
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);

    if (categoria.permisos && categoria.permisos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría porque contiene ${categoria.permisos.length} permiso(s). Primero debe remover esta categoría de todos los permisos.`,
      );
    }

    return await this.categoriasPermisoRepository.remove(categoria);
  }
}
