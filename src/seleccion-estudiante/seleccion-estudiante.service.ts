import { Injectable } from '@nestjs/common';
import { CreateSeleccionEstudianteDto } from './dto/create-seleccion-estudiante.dto';
import { UpdateSeleccionEstudianteDto } from './dto/update-seleccion-estudiante.dto';

@Injectable()
export class SeleccionEstudianteService {
  create(createSeleccionEstudianteDto: CreateSeleccionEstudianteDto) {
    return 'This action adds a new seleccionEstudiante';
  }

  findAll() {
    return `This action returns all seleccionEstudiante`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seleccionEstudiante`;
  }

  update(id: number, updateSeleccionEstudianteDto: UpdateSeleccionEstudianteDto) {
    return `This action updates a #${id} seleccionEstudiante`;
  }

  remove(id: number) {
    return `This action removes a #${id} seleccionEstudiante`;
  }
}
