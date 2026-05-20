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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClassesService = class ClassesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const classes = await this.prisma.class.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { students: true, teachers: true },
                },
                teachers: {
                    select: { id: true, name: true, subject: true },
                },
            },
        });
        return classes.map((cls) => ({
            id: cls.id,
            name: cls.name,
            teacher: cls.teacher,
            createdAt: cls.createdAt,
            studentCount: cls._count.students,
            teacherCount: cls._count.teachers,
            assignedTeachers: cls.teachers,
        }));
    }
    async create(name, teacher) {
        if (!name || !teacher) {
            throw new common_1.BadRequestException("Class name and teacher name are required");
        }
        const existing = await this.prisma.class.findUnique({ where: { name } });
        if (existing) {
            throw new common_1.BadRequestException(`Class "${name}" already exists`);
        }
        return this.prisma.class.create({
            data: { name, teacher },
        });
    }
    async update(id, name, teacher) {
        const cls = await this.prisma.class.findUnique({ where: { id } });
        if (!cls) {
            throw new common_1.NotFoundException(`Class with ID ${id} not found`);
        }
        if (name && name !== cls.name) {
            const existing = await this.prisma.class.findUnique({ where: { name } });
            if (existing) {
                throw new common_1.BadRequestException(`Class "${name}" already exists`);
            }
        }
        return this.prisma.class.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(teacher && { teacher }),
            },
        });
    }
    async delete(id) {
        const cls = await this.prisma.class.findUnique({
            where: { id },
            include: { _count: { select: { students: true } } },
        });
        if (!cls) {
            throw new common_1.NotFoundException(`Class with ID ${id} not found`);
        }
        if (cls._count.students > 0) {
            throw new common_1.BadRequestException(`Cannot delete "${cls.name}" — it still has ${cls._count.students} student(s). Remove or reassign them first.`);
        }
        await this.prisma.teacher.deleteMany({ where: { classId: id } });
        await this.prisma.class.delete({ where: { id } });
        return { success: true };
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map