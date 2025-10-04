import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMallaCurricularDto } from './dto/create-malla_curricular.dto';
import { UpdateMallaCurricularDto } from './dto/update-malla_curricular.dto';
import { MallaCurricular } from './entities/malla_curricular.entity';
import { Programa } from '@/programas/entities/programa.entity';

@Injectable()
export class MallaCurricularService {
  constructor(
    @InjectRepository(MallaCurricular)
    private readonly mallaCurricularRepository: Repository<MallaCurricular>,
    @InjectRepository(Programa)
    private readonly programaRepository: Repository<Programa>,
  ) {}

  async create(
    createMallaCurricularDto: CreateMallaCurricularDto,
  ): Promise<MallaCurricular> {
    // Verificar que el programa existe
    const programa = await this.programaRepository.findOne({
      where: { id: createMallaCurricularDto.programaId },
    });

    if (!programa) {
      throw new NotFoundException(
        `Programa con ID ${createMallaCurricularDto.programaId} no encontrado`,
      );
    }

    // Verificar que no existe una malla con la misma versión para el mismo programa
    const mallaExistente = await this.mallaCurricularRepository.findOne({
      where: {
        version: createMallaCurricularDto.version,
        programaId: createMallaCurricularDto.programaId,
      },
    });

    if (mallaExistente) {
      throw new ConflictException(
        `Ya existe una malla curricular con la versión "${createMallaCurricularDto.version}" para este programa`,
      );
    }

    const mallaCurricular = this.mallaCurricularRepository.create({
      version: createMallaCurricularDto.version,
      programaId: createMallaCurricularDto.programaId,
    });

    return await this.mallaCurricularRepository.save(mallaCurricular);
  }

  async findAll(): Promise<MallaCurricular[]> {
    return this.mallaCurricularRepository.find({
      relations: ['programa'],
    });
  }

  async findByPrograma(programaId: number): Promise<MallaCurricular[]> {
    return this.mallaCurricularRepository.find({
      where: { programaId },
      relations: ['programa'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<MallaCurricular> {
    const malla = await this.mallaCurricularRepository.findOne({
      where: { id },
      relations: ['programa', 'cursos'],
    });

    if (!malla) {
      throw new NotFoundException(
        `Malla curricular con ID ${id} no encontrada`,
      );
    }

    return malla;
  }

  async update(
    id: number,
    updateMallaCurricularDto: UpdateMallaCurricularDto,
  ): Promise<MallaCurricular> {
    const malla = await this.findOne(id);

    Object.assign(malla, updateMallaCurricularDto);
    return await this.mallaCurricularRepository.save(malla);
  }

  async remove(id: number): Promise<void> {
    const malla = await this.findOne(id);
    await this.mallaCurricularRepository.remove(malla);
  }
}
