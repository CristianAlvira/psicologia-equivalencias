import { Injectable } from '@nestjs/common';
import { CreateMallaCurricularDto } from './dto/create-malla_curricular.dto';
import { UpdateMallaCurricularDto } from './dto/update-malla_curricular.dto';

@Injectable()
export class MallaCurricularService {
  create(createMallaCurricularDto: CreateMallaCurricularDto) {
    return 'This action adds a new mallaCurricular';
  }

  findAll() {
    return `This action returns all mallaCurricular`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mallaCurricular`;
  }

  update(id: number, updateMallaCurricularDto: UpdateMallaCurricularDto) {
    return `This action updates a #${id} mallaCurricular`;
  }

  remove(id: number) {
    return `This action removes a #${id} mallaCurricular`;
  }
}
