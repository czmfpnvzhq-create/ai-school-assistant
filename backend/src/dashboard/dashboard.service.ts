import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private adminStatsCache: { data: Record<string, unknown>; expires: number } | null = null;

  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    try {
      if (this.adminStatsCache && this.adminStatsCache.expires > Date.now()) {
        return this.adminStatsCache.data;
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);

      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        feesCollectedAgg,
        feesPending,
        absentToday,
        topStudentsData,
        recentNotices,
        weekAttendance,
      ] = await Promise.all([
        this.prisma.student.count(),
        this.prisma.teacher.count(),
        this.prisma.class.count(),
        this.prisma.fee.aggregate({
          where: { paid: true },
          _sum: { amount: true },
        }),
        this.prisma.fee.count({ where: { paid: false } }),
        this.prisma.attendance.count({
          where: {
            date: { gte: startOfToday, lte: endOfToday },
            status: 'absent',
          },
        }),
        this.prisma.student.findMany({
          orderBy: { gradeAvg: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            gradeAvg: true,
            class: { select: { name: true } },
          },
        }),
        this.prisma.notice.findMany({
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
          },
        }),
        this.prisma.attendance.findMany({
          where: { date: { gte: startOfWeek, lte: endOfToday } },
          select: { date: true, status: true },
        }),
      ]);

      const feesCollected = feesCollectedAgg._sum.amount ?? 0;

      const topStudents = topStudentsData.map((s, index) => ({
        id: s.id,
        rank: index + 1,
        name: s.name,
        className: s.class?.name || 'No Class',
        gradeAvg: s.gradeAvg,
      }));

      const dayBuckets = new Map<string, { total: number; present: number }>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayBuckets.set(key, { total: 0, present: 0 });
      }

      for (const record of weekAttendance) {
        const key = record.date.toISOString().slice(0, 10);
        const bucket = dayBuckets.get(key);
        if (!bucket) continue;
        bucket.total += 1;
        if (record.status === 'present') bucket.present += 1;
      }

      const attendanceData: Array<{ name: string; rate: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const bucket = dayBuckets.get(key) ?? { total: 0, present: 0 };
        const percentage =
          bucket.total === 0 ? 100 : Math.round((bucket.present / bucket.total) * 100);
        attendanceData.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          rate: percentage,
        });
      }

      const result = {
        totalStudents,
        totalTeachers,
        totalClasses,
        feesCollected,
        feesPending,
        absentToday,
        topStudents,
        recentNotices,
        attendanceData,
      };

      this.adminStatsCache = {
        data: result,
        expires: Date.now() + 60_000,
      };

      return result;
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

  async getStudentStats(userName: string) {
    try {
      // Find the first student matching the userName
      const student = await this.prisma.student.findFirst({
        where: { name: userName },
        include: {
          class: true,
          attendances: {
            orderBy: { date: 'desc' },
            take: 30, // Get last 30 days of attendance
          },
          grades: {
            orderBy: { examDate: 'desc' },
            take: 10,
          },
        },
      });

      // Get latest notices
      const recentNotices = await this.prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (!student) {
        return { student: null, recentNotices };
      }

      // Calculate attendance stats
      const totalDays = student.attendances.length;
      const presentDays = student.attendances.filter(a => a.status === 'present' || a.status === 'late').length;
      const absentDays = student.attendances.filter(a => a.status === 'absent').length;
      const lateDays = student.attendances.filter(a => a.status === 'late').length;
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      return {
        student: {
          id: student.id,
          name: student.name,
          className: student.class?.name || 'Unassigned',
          gradeAvg: student.gradeAvg,
          attendance: {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            percentage: attendancePercentage,
            records: student.attendances.map(a => ({
              date: a.date.toISOString(),
              status: a.status,
            })),
          },
          recentGrades: student.grades.map(g => ({
            id: g.id,
            subject: g.subject,
            score: g.score,
            examDate: g.examDate,
          })),
        },
        recentNotices,
      };
    } catch (error) {
      console.error("Failed to fetch student stats", error);
      throw new InternalServerErrorException("Failed to fetch student stats");
    }
  }

  async getParentStats(parentEmail: string) {
    try {
      // Find the child associated with the parent's email.
      const student = await this.prisma.student.findFirst({
        where: { parentEmail: parentEmail },
        include: {
          class: true,
          attendances: {
            orderBy: { date: 'desc' },
            take: 30,
          },
          grades: {
            orderBy: { examDate: 'desc' },
            take: 10,
          },
          fees: {
            orderBy: { dueDate: 'desc' },
          },
        },
      });

      // Get latest notices
      const recentNotices = await this.prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (!student) {
        return { child: null, recentNotices };
      }

      // Calculate attendance stats
      const totalDays = student.attendances.length;
      const presentDays = student.attendances.filter(a => a.status === 'present').length;
      const lateDays = student.attendances.filter(a => a.status === 'late').length;
      const absentDays = student.attendances.filter(a => a.status === 'absent').length;
      const attendancePercentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

      const mapGrade = (g: { id: number; subject: string; score: number; examDate: Date }) => ({
        id: g.id,
        subject: g.subject,
        score: g.score,
        examDate: g.examDate,
      });

      const mapFee = (f: { id: number; amount: number; paid: boolean; dueDate: Date; paidAt: Date | null }) => ({
        id: f.id,
        amount: f.amount,
        paid: f.paid,
        dueDate: f.dueDate,
        paidAt: f.paidAt,
      });

      const fees = student.fees.map(mapFee);
      const latestFee = fees.length > 0 ? fees[0] : null;
      const feeSummary = {
        total: fees.reduce((sum, f) => sum + f.amount, 0),
        paid: fees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0),
        pending: fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0),
      };

      const grades = student.grades.map(mapGrade);

      return {
        child: {
          id: student.id,
          name: student.name,
          className: student.class?.name || 'Unassigned',
          gradeAvg: student.gradeAvg,
          attendance: {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            percentage: attendancePercentage,
            records: student.attendances.map(a => ({
              date: a.date.toISOString(),
              status: a.status,
            })),
          },
          recentGrades: grades.slice(0, 5),
          grades,
          fees,
          latestFee,
          feeSummary,
        },
        recentNotices,
      };
    } catch (error) {
      console.error("Failed to fetch parent stats", error);
      throw new InternalServerErrorException("Failed to fetch parent stats");
    }
  }
}
