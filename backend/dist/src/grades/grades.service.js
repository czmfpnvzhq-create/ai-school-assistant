"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GradesService = class GradesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGrades(classId, subject, examDateStr) {
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
    async saveGrades(records) {
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
            }
            else {
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
        const uniqueStudentIds = Array.from(new Set(records.map((r) => r.studentId)));
        for (const studentId of uniqueStudentIds) {
            await this.recalculateStudentGradeAvg(studentId);
        }
        return { success: true };
    }
    async getGradesReport(classId, subject) {
        const whereClause = {};
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
        let currentRank = 1;
        let prevScore = -1;
        return grades.map((g, idx) => {
            if (g.score !== prevScore) {
                currentRank = idx + 1;
                prevScore = g.score;
            }
            let letter = "F";
            if (g.score >= 90)
                letter = "A";
            else if (g.score >= 80)
                letter = "B";
            else if (g.score >= 70)
                letter = "C";
            else if (g.score >= 60)
                letter = "D";
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
    async recalculateStudentGradeAvg(studentId) {
        const studentGrades = await this.prisma.grade.findMany({
            where: { studentId },
        });
        const avg = studentGrades.length > 0
            ? studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length
            : 0;
        await this.prisma.student.update({
            where: { id: studentId },
            data: { gradeAvg: avg },
        });
    }
};
exports.GradesService = GradesService;
exports.GradesService = GradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GradesService);
//# sourceMappingURL=grades.service.js.map