"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let TeachersService = class TeachersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.teacher.findMany({
            include: {
                class: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    }
    async create(body) {
        const { name, email, subject, classId } = body;
        if (!name || !email || !subject) {
            throw new common_1.BadRequestException("Name, Email, and Subject are required");
        }
        const existingTeacher = await this.prisma.teacher.findUnique({
            where: { email },
        });
        if (existingTeacher) {
            throw new common_1.BadRequestException("Teacher with this email already exists");
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException("User with this email already exists");
        }
        const hashedPassword = await bcrypt.hash("teacher123", 10);
        return this.prisma.$transaction(async (tx) => {
            await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: "TEACHER",
                },
            });
            const teacher = await tx.teacher.create({
                data: {
                    name,
                    email,
                    subject,
                    classId: classId ? parseInt(classId, 10) : null,
                },
                include: {
                    class: true,
                },
            });
            return teacher;
        });
    }
    async update(id, body) {
        const { name, email, subject, classId } = body;
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
        });
        if (!teacher) {
            throw new common_1.NotFoundException(`Teacher with ID ${id} not found`);
        }
        if (email && email !== teacher.email) {
            const existingTeacher = await this.prisma.teacher.findUnique({
                where: { email },
            });
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingTeacher || existingUser) {
                throw new common_1.BadRequestException("Email is already in use by another user");
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedTeacher = await tx.teacher.update({
                where: { id },
                data: {
                    name: name !== undefined ? name : undefined,
                    email: email !== undefined ? email : undefined,
                    subject: subject !== undefined ? subject : undefined,
                    classId: classId !== undefined ? (classId ? parseInt(classId, 10) : null) : undefined,
                },
                include: {
                    class: true,
                },
            });
            const user = await tx.user.findUnique({
                where: { email: teacher.email },
            });
            if (user) {
                await tx.user.update({
                    where: { email: teacher.email },
                    data: {
                        name: name !== undefined ? name : undefined,
                        email: email !== undefined ? email : undefined,
                    },
                });
            }
            return updatedTeacher;
        });
    }
    async delete(id) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
        });
        if (!teacher) {
            throw new common_1.NotFoundException(`Teacher with ID ${id} not found`);
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.teacher.delete({
                where: { id },
            });
            const user = await tx.user.findUnique({
                where: { email: teacher.email },
            });
            if (user) {
                await tx.user.delete({
                    where: { email: teacher.email },
                });
            }
            return { success: true };
        });
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map