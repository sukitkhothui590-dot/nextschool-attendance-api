import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttendanceService } from './attendance.service';
import { AttendanceSummaryQueryDto } from './dto/attendance-summary-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Check in one student for the current Bangkok business date' })
  checkIn(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.checkIn(dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get attendance summary for a Bangkok business date' })
  summary(@Query() query: AttendanceSummaryQueryDto) {
    return this.attendanceService.getSummary(query.date);
  }
}
