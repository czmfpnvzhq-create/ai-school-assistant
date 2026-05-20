import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Fetch concurrently for better performance
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        fees,
        absentToday,
        topStudentsData,
        recentNotices
      ] = await Promise.all([
        this.prisma.student.count(),
        this.prisma.teacher.count(),
        this.prisma.class.count(),
        this.prisma.fee.findMany(),
        this.prisma.attendance.count({
          where: {
            date: { gte: startOfToday, lte: endOfToday },
            status: 'absent'
          }
        }),
        this.prisma.student.findMany({
          orderBy: { gradeAvg: 'desc' },
          take: 5,
          include: { class: true }
        }),
        this.prisma.notice.findMany({
          orderBy: { createdAt: 'desc' },
          take: 3
        })
      ]);

      // Calculate Fees
      const feesCollected = fees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0);
      const feesPending = fees.filter(f => !f.paid).length;

      const topStudents = topStudentsData.map((s, index) => ({
        id: s.id,
        rank: index + 1,
        name: s.name,
        className: s.class?.name || 'No Class',
        gradeAvg: s.gradeAvg
      }));

      // Attendance chart data for the last 7 days
      const attendanceData: Array<{ name: string; rate: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);

        const dayRecords = await this.prisma.attendance.findMany({
          where: { date: { gte: start, lte: end } }
        });

        const total = dayRecords.length;
        const present = dayRecords.filter(r => r.status === 'present').length;
        
        const percentage = total === 0 ? 100 : Math.round((present / total) * 100);

        attendanceData.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          rate: percentage
        });
      }

      return {
        totalStudents,
        totalTeachers,
        totalClasses,
        feesCollected,
        feesPending,
        absentToday,
        topStudents,
        recentNotices,
        attendanceData
      };
    } catch (error) {
      console.error("Failed to fetch admin stats in NestJS", error);
      throw new InternalServerErrorException("Failed to fetch stats");
    }
  }

  async getTeacherStats(email: string) {
    try {
      // Find teacher record by email to get assigned class
      const teacher = await this.prisma.teacher.findUnique({
        where: { email },
        include: { class: true },
      });

      if (!teacher || !teacher.class) {
        return {
          teacher: teacher ? { id: teacher.id, name: teacher.name, subject: teacher.subject } : null,
          assignedClass: null,
          totalStudents: 0,
          todayAttendanceRate: 0,
          classGradeAvg: 0,
          students: [],
          todayAttendance: [],
          recentGrades: [],
        };
      }

      const classId = teacher.class.id;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Run queries concurrently for better performance
      const [
        totalStudents,
        todayAttendance,
        students,
        recentGrades
      ] = await Promise.all([
        // Total students in class
        this.prisma.student.count({ where: { classId } }),
        
        // Today's attendance for this class
        this.prisma.attendance.findMany({
          where: {
            date: { gte: startOfToday, lte: endOfToday },
            student: { classId },
          },
          include: { student: true },
        }),

        // Class grade average
        this.prisma.student.findMany({
          where: { classId },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, gradeAvg: true },
        }),

        // Recent grades for this class (last 10)
        this.prisma.grade.findMany({
          where: { student: { classId } },
          orderBy: { examDate: 'desc' },
          take: 10,
          include: { student: { select: { name: true } } },
        })
      ]);

      const presentCount = todayAttendance.filter(
        (a) => a.status === 'present' || a.status === 'late'
      ).length;
      
      const todayAttendanceRate =
        todayAttendance.length > 0
          ? Math.round((presentCount / todayAttendance.length) * 100)
          : 0;

      const classGradeAvg =
        students.length > 0
          ? parseFloat(
              (
                students.reduce((sum, s) => sum + s.gradeAvg, 0) /
                students.length
              ).toFixed(2)
            )
          : 0;

      // Build today's attendance map for quick marking
      const attendanceMap: Record<number, string> = {};
      todayAttendance.forEach((a) => {
        attendanceMap[a.studentId] = a.status;
      });

      return {
        teacher: {
          id: teacher.id,
          name: teacher.name,
          subject: teacher.subject,
        },
        assignedClass: {
          id: teacher.class.id,
          name: teacher.class.name,
        },
        totalStudents,
        todayAttendanceRate,
        todayMarked: todayAttendance.length > 0,
        classGradeAvg,
        students: students.map((s) => ({
          ...s,
          todayStatus: attendanceMap[s.id] || null,
        })),
        recentGrades: recentGrades.map((g) => ({
          id: g.id,
          studentName: g.student.name,
          subject: g.subject,
          score: g.score,
          examDate: g.examDate,
        })),
      };
    } catch (error) {
      console.error("Failed to fetch teacher stats", error);
      throw new InternalServerErrorException("Failed to fetch teacher stats");
    }
  }
}
