import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(classId?: number, paidStatus?: string) {
    const where: any = {};
    
    if (classId) {
      where.student = { classId };
    }
    
    if (paidStatus === "true") {
      where.paid = true;
    } else if (paidStatus === "false") {
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

    // Compute metrics for the class (or all classes) ignoring the paidStatus filter
    const summaryWhere: any = {};
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
      } else {
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

  async markAsPaid(id: number) {
    const fee = await this.prisma.fee.findUnique({
      where: { id },
    });
    if (!fee) {
      throw new NotFoundException(`Fee record with ID ${id} not found`);
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
}
