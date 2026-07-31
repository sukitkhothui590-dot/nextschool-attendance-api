import { Module } from '@nestjs/common';
import { Clock } from '../common/time/clock';
import { SystemClock } from '../common/time/system-clock';
import { StudentsModule } from '../students/students.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceDomainService } from './attendance-domain.service';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [StudentsModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceRepository,
    AttendanceDomainService,
    { provide: Clock, useClass: SystemClock },
  ],
  exports: [AttendanceService, AttendanceDomainService, Clock],
})
export class AttendanceModule {}
