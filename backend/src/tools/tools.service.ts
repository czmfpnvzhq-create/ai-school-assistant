import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CLASS_NOT_FOUND_ERROR = "Class not found. Available classes: Class 6, Class 7, Class 8, Class 10";

@Injectable()
export class ToolsService {
  constructor(private prisma: PrismaService) {}

  private async getClassOrError(className: string) {
    return await this.prisma.class.findFirst({
      where: { name: { equals: className, mode: "insensitive" } },
    });
  }

  async executeTool(toolName: string, toolArgs: any) {
    try {
      switch (toolName) {
        case "get_student_by_name": {
          const { name } = toolArgs;
          if (!name || typeof name !== "string" || !name.trim()) {
            return { error: "Argument 'name' is required (student full or partial name)." };
          }

          const search = name.trim();
          const words = search.split(/\s+/).filter((w: string) => w.length >= 2);

          const students = await this.prisma.student.findMany({
            where:
              words.length > 0
                ? {
                    AND: words.map((word: string) => ({
                      name: { contains: word, mode: "insensitive" as const },
                    })),
                  }
                : { name: { contains: search, mode: "insensitive" as const } },
            include: {
              class: { select: { name: true } },
              attendances: { orderBy: { date: "desc" }, take: 30 },
              grades: { orderBy: { examDate: "desc" }, take: 10 },
              fees: { orderBy: { dueDate: "desc" }, take: 5 },
            },
            orderBy: { name: "asc" },
            take: 10,
          });

          if (students.length === 0) {
            return {
              success: false,
              message: `No student found matching "${search}". Try the exact spelling (e.g. "Ahmed Raza" in Class 6) or list a class first.`,
              matches: [],
            };
          }

          const mapStudent = (s: (typeof students)[0]) => {
            const present = s.attendances.filter((a) => a.status === "present").length;
            const absent = s.attendances.filter((a) => a.status === "absent").length;
            const late = s.attendances.filter((a) => a.status === "late").length;
            const totalAtt = s.attendances.length;
            const attendanceRate =
              totalAtt > 0 ? Math.round(((present + late) / totalAtt) * 100) : 0;

            return {
              id: s.id,
              name: s.name,
              className: s.class.name,
              gradeAvg: s.gradeAvg,
              parentEmail: s.parentEmail,
              phone: s.phone,
              attendanceSummary: {
                present,
                absent,
                late,
                totalDaysTracked: totalAtt,
                attendanceRatePercent: attendanceRate,
              },
              recentGrades: s.grades.map((g) => ({
                subject: g.subject,
                score: g.score,
                examDate: g.examDate.toISOString().split("T")[0],
              })),
              fees: s.fees.map((f) => ({
                amount: f.amount,
                paid: f.paid,
                dueDate: f.dueDate.toISOString().split("T")[0],
              })),
            };
          };

          if (students.length === 1) {
            return { success: true, student: mapStudent(students[0]) };
          }

          return {
            success: true,
            multipleMatches: true,
            message: `Found ${students.length} students matching "${search}". Ask the user to pick one or provide the full name.`,
            matches: students.map((s) => ({
              id: s.id,
              name: s.name,
              className: s.class.name,
              gradeAvg: s.gradeAvg,
            })),
          };
        }

        case "get_students_by_class": {
          const { class_name } = toolArgs;
          if (!class_name) return { error: "Argument 'class_name' is required." };

          const targetClass = await this.getClassOrError(class_name);
          if (!targetClass) return { error: CLASS_NOT_FOUND_ERROR };

          const students = await this.prisma.student.findMany({
            where: { classId: targetClass.id },
            select: { id: true, name: true, gradeAvg: true },
            orderBy: { name: "asc" },
          });

          if (students.length === 0) {
            return { success: true, data: [], message: "No records found for this query" };
          }

          return students;
        }

        case "get_attendance_report": {
          const { date, status, class_name } = toolArgs;
          if (!date) return { error: "Argument 'date' (format YYYY-MM-DD) is required." };

          const targetDate = new Date(date);
          if (isNaN(targetDate.getTime())) return { error: "Invalid date format. Please use YYYY-MM-DD." };

          const startDate = new Date(targetDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(targetDate);
          endDate.setHours(23, 59, 59, 999);

          const whereClause: any = {
            date: { gte: startDate, lte: endDate },
          };

          if (status) whereClause.status = status;

          if (class_name) {
            const targetClass = await this.getClassOrError(class_name);
            if (!targetClass) return { error: CLASS_NOT_FOUND_ERROR };
            whereClause.student = { classId: targetClass.id };
          }

          const records = await this.prisma.attendance.findMany({
            where: whereClause,
            include: { student: { include: { class: true } } },
            orderBy: { student: { name: "asc" } },
          });

          if (records.length === 0) {
            return { success: true, data: [], message: "No records found for this query" };
          }

          return records.map((r) => ({
            studentName: r.student.name,
            className: r.student.class.name,
            status: r.status,
            date: r.date.toISOString().split("T")[0],
          }));
        }

        case "add_student": {
          const { name, class_name } = toolArgs;
          if (!name || !class_name) return { error: "Arguments 'name' and 'class_name' are required." };

          const targetClass = await this.getClassOrError(class_name);
          if (!targetClass) return { error: CLASS_NOT_FOUND_ERROR };

          const existingStudent = await this.prisma.student.findFirst({
            where: { 
              name: { equals: name, mode: "insensitive" },
              classId: targetClass.id 
            }
          });

          if (existingStudent) {
            return { error: "Student with this name already exists in this class" };
          }

          const newStudent = await this.prisma.student.create({
            data: {
              name: name,
              classId: targetClass.id,
              gradeAvg: 0,
            },
          });

          return {
            success: true,
            student: {
              id: newStudent.id,
              name: newStudent.name,
              className: targetClass.name,
            },
          };
        }

        case "get_top_students": {
          const { class_name, limit } = toolArgs;
          if (!class_name) return { error: "Argument 'class_name' is required." };

          const targetClass = await this.getClassOrError(class_name);
          if (!targetClass) return { error: CLASS_NOT_FOUND_ERROR };

          const takeLimit = typeof limit === "number" ? limit : parseInt(limit || "5", 10);
          if (isNaN(takeLimit) || takeLimit <= 0) {
            return { error: "Argument 'limit' must be a valid positive number." };
          }

          const students = await this.prisma.student.findMany({
            where: { classId: targetClass.id },
            orderBy: { gradeAvg: "desc" },
            take: takeLimit,
          });

          if (students.length === 0) {
            return { success: true, data: [], message: "No records found for this query" };
          }

          return students.map((s, idx) => ({
            rank: idx + 1,
            name: s.name,
            gradeAvg: s.gradeAvg,
          }));
        }

        case "get_class_summary": {
          const { class_name } = toolArgs;
          if (!class_name) return { error: "Argument 'class_name' is required." };

          const targetClass = await this.getClassOrError(class_name);
          if (!targetClass) return { error: CLASS_NOT_FOUND_ERROR };

          const stats = await this.prisma.student.aggregate({
            where: { classId: targetClass.id },
            _count: { id: true },
            _avg: { gradeAvg: true },
          });

          return {
            className: targetClass.name,
            totalStudents: stats._count.id || 0,
            averageGrade: stats._avg.gradeAvg ? parseFloat(stats._avg.gradeAvg.toFixed(2)) : 0,
          };
        }

        case "get_fee_report": {
          const [collectedAgg, pendingAgg, pendingCount, totalCount] = await Promise.all([
            this.prisma.fee.aggregate({
              where: { paid: true },
              _sum: { amount: true },
            }),
            this.prisma.fee.aggregate({
              where: { paid: false },
              _sum: { amount: true },
            }),
            this.prisma.fee.count({ where: { paid: false } }),
            this.prisma.fee.count(),
          ]);

          const collected = collectedAgg._sum.amount ?? 0;
          const pending = pendingAgg._sum.amount ?? 0;
          const total = collected + pending;
          const collectionRate =
            total > 0 ? parseFloat(((collected / total) * 100).toFixed(2)) : 0;

          return {
            totalFees: totalCount,
            collectedAmount: collected,
            pendingAmount: pending,
            pendingRecords: pendingCount,
            collectionRatePercent: collectionRate,
          };
        }

        case "get_notices": {
          const notices = await this.prisma.notice.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              title: true,
              postedBy: true,
              createdAt: true,
            },
          });

          return notices.map((n) => ({
            id: n.id,
            title: n.title,
            postedBy: n.postedBy,
            date: n.createdAt.toISOString().split('T')[0],
          }));
        }

        default: {
          return { error: `Unknown tool name: ${toolName}` };
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error(`[ToolsService] Exception during execution:`, err);
      return { error: err.message || "An internal error occurred during database execution." };
    }
  }
}
