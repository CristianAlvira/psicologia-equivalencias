import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { Curso } from './entities/curso.entity';
import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(MallaCurricular)
    private readonly mallaCurricularRepository: Repository<MallaCurricular>,
  ) {}

  async create(createCursoDto: CreateCursoDto): Promise<Curso> {
    // Verificar que la malla curricular existe
    const malla = await this.mallaCurricularRepository.findOne({
      where: { id: createCursoDto.mallaCurricularId },
    });

    if (!malla) {
      throw new NotFoundException(
        `Malla curricular con ID ${createCursoDto.mallaCurricularId} no encontrada`,
      );
    }

    const curso = this.cursoRepository.create(createCursoDto);
    return await this.cursoRepository.save(curso);
  }

  async findAll(): Promise<Curso[]> {
    return this.cursoRepository.find({
      relations: ['mallaCurricular'],
    });
  }

  async findByMalla(mallaId: number): Promise<Curso[]> {
    return this.cursoRepository.find({
      where: { mallaCurricularId: mallaId },
      relations: ['mallaCurricular'],
      order: { semestre: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Curso> {
    const curso = await this.cursoRepository.findOne({
      where: { id },
      relations: ['mallaCurricular'],
    });

    if (!curso) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }

    return curso;
  }

  async update(id: number, updateCursoDto: UpdateCursoDto): Promise<Curso> {
    const curso = await this.findOne(id);
    Object.assign(curso, updateCursoDto);
    return await this.cursoRepository.save(curso);
  }

  async remove(id: number): Promise<void> {
    const curso = await this.findOne(id);
    await this.cursoRepository.remove(curso);
  }
}
