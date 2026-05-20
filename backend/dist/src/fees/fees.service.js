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
exports.FeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeesService = class FeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(classId, paidStatus) {
        const where = {};
        if (classId) {
            where.student = { classId };
        }
        if (paidStatus === "true") {
            where.paid = true;
        }
        else if (paidStatus === "false") {
            where.paid = false;
        }
        const fees = await this.prisma.fee.findMany({
            where,
            include: {
                student: {
                    include: {
                        class: true,
                    },
                },
            },
            orderBy: {
                dueDate: "asc",
            },
        });
        const summaryWhere = {};
        if (classId) {
            summaryWhere.student = { classId };
        }
        const allFees = await this.prisma.fee.findMany({
            where: summaryWhere,
            select: {
                amount: true,
                paid: true,
            },
        });
        let total = 0;
        let collected = 0;
        let pending = 0;
        for (const f of allFees) {
            total += f.amount;
            if (f.paid) {
                collected += f.amount;
            }
            else {
                pending += f.amount;
            }
        }
        const rate = total > 0 ? parseFloat(((collected / total) * 100).toFixed(2)) : 0.0;
        return {
            fees,
            summary: {
                total,
                collected,
                pending,
                rate,
            },
        };
    }
    async markAsPaid(id) {
        const fee = await this.prisma.fee.findUnique({
            where: { id },
        });
        if (!fee) {
            throw new common_1.NotFoundException(`Fee record with ID ${id} not found`);
        }
        return this.prisma.fee.update({
            where: { id },
            data: {
                paid: true,
                paidAt: new Date(),
            },
            include: {
                student: {
                    include: {
                        class: true,
                    },
                },
            },
        });
    }
};
exports.FeesService = FeesService;
exports.FeesService = FeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeesService);
//# sourceMappingURL=fees.service.js.map