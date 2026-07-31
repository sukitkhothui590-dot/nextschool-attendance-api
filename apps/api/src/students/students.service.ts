import { Injectable } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { mapStudent, StudentResponse } from './dto/student-response';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async list(query: ListStudentsQueryDto): Promise<{
    data: StudentResponse[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { items, total } = await this.studentsRepository.list(query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

    return {
      data: items.map(mapStudent),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }
}
