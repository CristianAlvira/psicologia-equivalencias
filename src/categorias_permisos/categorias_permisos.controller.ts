import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriasPermisosService } from './categorias_permisos.service';
import { CreateCategoriasPermisoDto } from './dto/create-categorias_permiso.dto';
import { UpdateCategoriasPermisoDto } from './dto/update-categorias_permiso.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('categorias-permisos')
export class CategoriasPermisosController {
  constructor(
    private readonly categoriasPermisosService: CategoriasPermisosService,
  ) {}

  @Post()
  create(@Body() createCategoriasPermisoDto: CreateCategoriasPermisoDto) {
    return this.categoriasPermisosService.create(createCategoriasPermisoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoriasPermisosService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasPermisosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoriasPermisoDto: UpdateCategoriasPermisoDto,
  ) {
    return this.categoriasPermisosService.update(
      +id,
      updateCategoriasPermisoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriasPermisosService.remove(+id);
  }
}
