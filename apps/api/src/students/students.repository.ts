import { Injectable } from '@nestjs/common';
import { Prisma, Student, StudentStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ListStudentsQueryDto, SortOrder, StudentSortBy } from './dto/list-students-query.dto';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Student | null> {
    return this.prisma.student.findUnique({ where: { id } });
  }

  findByCode(studentCode: string): Promise<Student | null> {
    return this.prisma.student.findUnique({ where: { studentCode } });
  }

  async list(query: ListStudentsQueryDto): Promise<{ items: Student[]; total: number }> {
    const where: Prisma.StudentWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { studentCode: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(query.sortBy, query.sortOrder);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total };
  }

  countByStatus(status: StudentStatus): Promise<number> {
    return this.prisma.student.count({ where: { status } });
  }

  private buildOrderBy(
    sortBy: StudentSortBy,
    sortOrder: SortOrder,
  ): Prisma.StudentOrderByWithRelationInput[] {
    const direction = sortOrder === SortOrder.desc ? 'desc' : 'asc';
    const primary: Prisma.StudentOrderByWithRelationInput = { [sortBy]: direction };

    if (sortBy === StudentSortBy.studentCode) {
      return [primary, { id: 'asc' }];
    }

    return [primary, { studentCode: 'asc' }, { id: 'asc' }];
  }
}
