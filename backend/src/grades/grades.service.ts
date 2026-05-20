import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async getGrades(classId: number, subject: string, examDateStr: string) {
    const students = await this.prisma.student.findMany({
      where: { classId },
      orderBy: { name: "asc" },
    });

    const normalizedDate = new Date(examDateStr + "T00:00:00.000Z");

    const grades = await this.prisma.grade.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        subject,
        examDate: normalizedDate,
      },
    });

    return students.map((s) => {
      const g = grades.find((g) => g.studentId === s.id);
      return {
        studentId: s.id,
        studentName: s.name,
        score: g ? g.score : null,
      };
    });
  }

  async saveGrades(
    records: { studentId: number; subject: string; score: number; examDate: string }[]
  ) {
    for (const r of records) {
      const normalizedDate = new Date(r.examDate + "T00:00:00.000Z");

      const existing = await this.prisma.grade.findFirst({
        where: {
          studentId: r.studentId,
          subject: r.subject,
          examDate: normalizedDate,
        },
      });

      if (existing) {
        await this.prisma.grade.update({
          where: { id: existing.id },
          data: { score: r.score },
        });
      } else {
        await this.prisma.grade.create({
          data: {
            studentId: r.studentId,
            subject: r.subject,
            score: r.score,
            examDate: normalizedDate,
          },
        });
      }
    }

    // Recalculate Student.gradeAvg for all affected students
    const uniqueStudentIds = Array.from(new Set(records.map((r) => r.studentId)));
    for (const studentId of uniqueStudentIds) {
      await this.recalculateStudentGradeAvg(studentId);
    }

    return { success: true };
  }

  async getGradesReport(classId?: number, subject?: string) {
    const whereClause: any = {};
    if (classId) {
      whereClause.student = { classId };
    }
    if (subject) {
      whereClause.subject = subject;
    }

    const grades = await this.prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        score: "desc",
      },
    });

    // Calculate ranks
    let currentRank = 1;
    let prevScore = -1;

    return grades.map((g, idx) => {
      if (g.score !== prevScore) {
        currentRank = idx + 1;
        prevScore = g.score;
      }

      let letter = "F";
      if (g.score >= 90) letter = "A";
      else if (g.score >= 80) letter = "B";
      else if (g.score >= 70) letter = "C";
      else if (g.score >= 60) letter = "D";

      return {
        rank: currentRank,
        studentId: g.studentId,
        studentName: g.student.name,
        className: g.student.class.name,
        subject: g.subject,
        score: g.score,
        gradeLetter: letter,
        examDate: g.examDate.toISOString().split("T")[0],
      };
    });
  }

  private async recalculateStudentGradeAvg(studentId: number) {
    const studentGrades = await this.prisma.grade.findMany({
      where: { studentId },
    });

    const avg =
      studentGrades.length > 0
        ? studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length
        : 0;

    await this.prisma.student.update({
      where: { id: studentId },
      data: { gradeAvg: avg },
    });
  }
}
