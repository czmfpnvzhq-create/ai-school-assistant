import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getClasses() {
    return this.prisma.class.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAll(search?: string, className?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

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

  async findOne(id: number) {
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
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Calculate attendance summary
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

  async create(body: any) {
    const { name, className, parentEmail, phone, address } = body;
    if (!name || !className) {
      throw new BadRequestException('Name and Class are required');
    }

    const targetClass = await this.prisma.class.findFirst({
      where: { name: { equals: className, mode: 'insensitive' } },
    });

    if (!targetClass) {
      throw new BadRequestException(`Class ${className} does not exist.`);
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

  async update(id: number, body: any) {
    const { name, className, parentEmail, phone, address } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (parentEmail !== undefined) updateData.parentEmail = parentEmail;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    if (className) {
      const targetClass = await this.prisma.class.findFirst({
        where: { name: { equals: className, mode: 'insensitive' } },
      });
      if (!targetClass) {
        throw new BadRequestException(`Class ${className} does not exist.`);
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

  async delete(id: number) {
    // Cascade delete is defined in schema (onDelete: Cascade)
    await this.prisma.student.delete({
      where: { id },
    });
    return { success: true };
  }
}
