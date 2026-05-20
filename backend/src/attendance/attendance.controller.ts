import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get()
  async getAttendance(
    @Query('date') date: string,
    @Query('classId') classId: string,
  ) {
    const parsedClassId = parseInt(classId, 10);
    return this.attendanceService.getAttendance(date, parsedClassId);
  }

  @Post()
  async saveAttendance(@Body() body: { records: any[] }) {
    return this.attendanceService.saveAttendance(body.records);
  }

  @Get('report')
  async getReport(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('classId') classId?: string,
  ) {
    const parsedClassId = classId ? parseInt(classId, 10) : undefined;
    return this.attendanceService.getReport(from, to, parsedClassId);
  }
}
