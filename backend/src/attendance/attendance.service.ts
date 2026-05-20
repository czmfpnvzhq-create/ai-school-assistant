import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async getAttendance(dateStr: string, classId: number) {
    if (!dateStr || !classId) {
      throw new BadRequestException('Date and classId are required');
    }

    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });
    if (!targetClass) {
      throw new BadRequestException('Class does not exist');
    }

    // Normalize date to UTC Midnight (00:00:00.000Z)
    const queryDate = new Date(dateStr);
    queryDate.setUTCHours(0, 0, 0, 0);

    const students = await this.prisma.student.findMany({
      where: { classId },
      orderBy: { name: 'asc' },
    });

    const attendances = await this.prisma.attendance.findMany({
      where: {
        date: queryDate,
        studentId: { in: students.map(s => s.id) },
      },
    });

    return students.map(student => {
      const att = attendances.find(a => a.studentId === student.id);
      return {
        studentId: student.id,
        studentName: student.name,
        status: att ? att.status : null,
      };
    });
  }

  async saveAttendance(records: { studentId: number; date: string; status: AttendanceStatus }[]) {
    if (!records || !Array.isArray(records)) {
      throw new BadRequestException('Records must be an array');
    }

    for (const record of records) {
      const recordDate = new Date(record.date);
      recordDate.setUTCHours(0, 0, 0, 0);

      // Verify student exists
      const studentExists = await this.prisma.student.findUnique({
        where: { id: record.studentId },
      });
      if (!studentExists) continue;

      await this.prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: record.studentId,
            date: recordDate,
          },
        },
        update: {
          status: record.status,
        },
        create: {
          studentId: record.studentId,
          date: recordDate,
          status: record.status,
        },
      });
    }

    return { success: true };
  }

  async getReport(fromStr: string, toStr: string, classId?: number) {
    if (!fromStr || !toStr) {
      throw new BadRequestException('from and to dates are required');
    }

    const fromDate = new Date(fromStr);
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(toStr);
    toDate.setUTCHours(23, 59, 59, 999);

    const whereStudent: any = {};
    if (classId) {
      whereStudent.classId = classId;
    }

    const students = await this.prisma.student.findMany({
      where: whereStudent,
      include: {
        class: true,
        attendances: {
          where: {
            date: {
              gte: fromDate,
              lte: toDate,
            },
          },
        },
      },
    });

    const report = students.map(student => {
      const present = student.attendances.filter(a => a.status === 'present').length;
      const absent = student.attendances.filter(a => a.status === 'absent').length;
      const late = student.attendances.filter(a => a.status === 'late').length;
      const total = student.attendances.length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

      return {
        studentId: student.id,
        studentName: student.name,
        className: student.class.name,
        present,
        absent,
        late,
        percentage,
      };
    });

    // Sort by attendance percentage ascending (worst first)
    report.sort((a, b) => a.percentage - b.percentage);

    return report;
  }
}
