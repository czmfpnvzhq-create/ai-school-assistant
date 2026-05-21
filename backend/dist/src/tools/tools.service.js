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
exports.ToolsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const CLASS_NOT_FOUND_ERROR = "Class not found. Available classes: Class 6, Class 7, Class 8, Class 10";
let ToolsService = class ToolsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getClassOrError(className) {
        return await this.prisma.class.findFirst({
            where: { name: { equals: className, mode: "insensitive" } },
        });
    }
    async executeTool(toolName, toolArgs) {
        try {
            switch (toolName) {
                case "get_students_by_class": {
                    const { class_name } = toolArgs;
                    if (!class_name)
                        return { error: "Argument 'class_name' is required." };
                    const targetClass = await this.getClassOrError(class_name);
                    if (!targetClass)
                        return { error: CLASS_NOT_FOUND_ERROR };
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
                    if (!date)
                        return { error: "Argument 'date' (format YYYY-MM-DD) is required." };
                    const targetDate = new Date(date);
                    if (isNaN(targetDate.getTime()))
                        return { error: "Invalid date format. Please use YYYY-MM-DD." };
                    const startDate = new Date(targetDate);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(targetDate);
                    endDate.setHours(23, 59, 59, 999);
                    const whereClause = {
                        date: { gte: startDate, lte: endDate },
                    };
                    if (status)
                        whereClause.status = status;
                    if (class_name) {
                        const targetClass = await this.getClassOrError(class_name);
                        if (!targetClass)
                            return { error: CLASS_NOT_FOUND_ERROR };
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
                    if (!name || !class_name)
                        return { error: "Arguments 'name' and 'class_name' are required." };
                    const targetClass = await this.getClassOrError(class_name);
                    if (!targetClass)
                        return { error: CLASS_NOT_FOUND_ERROR };
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
                    if (!class_name)
                        return { error: "Argument 'class_name' is required." };
                    const targetClass = await this.getClassOrError(class_name);
                    if (!targetClass)
                        return { error: CLASS_NOT_FOUND_ERROR };
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
                    if (!class_name)
                        return { error: "Argument 'class_name' is required." };
                    const targetClass = await this.getClassOrError(class_name);
                    if (!targetClass)
                        return { error: CLASS_NOT_FOUND_ERROR };
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
                    const collectionRate = total > 0 ? parseFloat(((collected / total) * 100).toFixed(2)) : 0;
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
        }
        catch (error) {
            const err = error;
            console.error(`[ToolsService] Exception during execution:`, err);
            return { error: err.message || "An internal error occurred during database execution." };
        }
    }
};
exports.ToolsService = ToolsService;
exports.ToolsService = ToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ToolsService);
//# sourceMappingURL=tools.service.js.map