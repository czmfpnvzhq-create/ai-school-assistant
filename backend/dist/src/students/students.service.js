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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentsService = class StudentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getClasses() {
        return this.prisma.class.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findAll(search, className, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { class: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (className && className !== 'All') {
            where.class = {
                name: { equals: className, mode: 'insensitive' },
            };
        }
        const [students, total] = await Promise.all([
            this.prisma.student.findMany({
                where,
                include: { class: true },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.student.count({ where }),
        ]);
        return {
            students,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const student = await this.prisma.student.findUnique({
            where: { id },
            include: {
                class: true,
                attendances: true,
                grades: true,
                fees: true,
            },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        const present = student.attendances.filter(a => a.status === 'present').length;
        const absent = student.attendances.filter(a => a.status === 'absent').length;
        const late = student.attendances.filter(a => a.status === 'late').length;
        const totalAttendances = student.attendances.length;
        const attendanceRate = totalAttendances > 0 ? Math.round(((present + late) / totalAttendances) * 100) : 100;
        return {
            id: student.id,
            name: student.name,
            class: student.class,
            gradeAvg: student.gradeAvg,
            parentEmail: student.parentEmail,
            phone: student.phone,
            address: student.address,
            attendanceSummary: {
                present,
                absent,
                late,
                total: totalAttendances,
                rate: attendanceRate,
            },
            grades: student.grades.map(g => ({
                id: g.id,
                subject: g.subject,
                score: g.score,
                examDate: g.examDate.toISOString().split('T')[0],
            })),
            fees: student.fees.map(f => ({
                id: f.id,
                amount: f.amount,
                paid: f.paid,
                dueDate: f.dueDate.toISOString().split('T')[0],
                paidAt: f.paidAt ? f.paidAt.toISOString().split('T')[0] : null,
            })),
        };
    }
    async create(body) {
        const { name, className, parentEmail, phone, address } = body;
        if (!name || !className) {
            throw new common_1.BadRequestException('Name and Class are required');
        }
        const targetClass = await this.prisma.class.findFirst({
            where: { name: { equals: className, mode: 'insensitive' } },
        });
        if (!targetClass) {
            throw new common_1.BadRequestException(`Class ${className} does not exist.`);
        }
        const student = await this.prisma.student.create({
            data: {
                name,
                classId: targetClass.id,
                parentEmail,
                phone,
                address,
                gradeAvg: 0,
            },
            include: { class: true },
        });
        return student;
    }
    async update(id, body) {
        const { name, className, parentEmail, phone, address } = body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (parentEmail !== undefined)
            updateData.parentEmail = parentEmail;
        if (phone !== undefined)
            updateData.phone = phone;
        if (address !== undefined)
            updateData.address = address;
        if (className) {
            const targetClass = await this.prisma.class.findFirst({
                where: { name: { equals: className, mode: 'insensitive' } },
            });
            if (!targetClass) {
                throw new common_1.BadRequestException(`Class ${className} does not exist.`);
            }
            updateData.classId = targetClass.id;
        }
        const student = await this.prisma.student.update({
            where: { id },
            data: updateData,
            include: { class: true },
        });
        return student;
    }
    async delete(id) {
        await this.prisma.student.delete({
            where: { id },
        });
        return { success: true };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map