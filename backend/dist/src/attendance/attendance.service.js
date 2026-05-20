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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAttendance(dateStr, classId) {
        if (!dateStr || !classId) {
            throw new common_1.BadRequestException('Date and classId are required');
        }
        const targetClass = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!targetClass) {
            throw new common_1.BadRequestException('Class does not exist');
        }
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
    async saveAttendance(records) {
        if (!records || !Array.isArray(records)) {
            throw new common_1.BadRequestException('Records must be an array');
        }
        for (const record of records) {
            const recordDate = new Date(record.date);
            recordDate.setUTCHours(0, 0, 0, 0);
            const studentExists = await this.prisma.student.findUnique({
                where: { id: record.studentId },
            });
            if (!studentExists)
                continue;
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
    async getReport(fromStr, toStr, classId) {
        if (!fromStr || !toStr) {
            throw new common_1.BadRequestException('from and to dates are required');
        }
        const fromDate = new Date(fromStr);
        fromDate.setUTCHours(0, 0, 0, 0);
        const toDate = new Date(toStr);
        toDate.setUTCHours(23, 59, 59, 999);
        const whereStudent = {};
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
        report.sort((a, b) => a.percentage - b.percentage);
        return report;
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map