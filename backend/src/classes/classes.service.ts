import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

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

  async create(name: string, teacher: string) {
    if (!name || !teacher) {
      throw new BadRequestException("Class name and teacher name are required");
    }

    const existing = await this.prisma.class.findUnique({ where: { name } });
    if (existing) {
      throw new BadRequestException(`Class "${name}" already exists`);
    }

    return this.prisma.class.create({
      data: { name, teacher },
    });
  }

  async update(id: number, name: string, teacher: string) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Check if new name conflicts with another class
    if (name && name !== cls.name) {
      const existing = await this.prisma.class.findUnique({ where: { name } });
      if (existing) {
        throw new BadRequestException(`Class "${name}" already exists`);
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

  async delete(id: number) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });

    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    if (cls._count.students > 0) {
      throw new BadRequestException(
        `Cannot delete "${cls.name}" — it still has ${cls._count.students} student(s). Remove or reassign them first.`
      );
    }

    // Delete associated teachers first, then the class
    await this.prisma.teacher.deleteMany({ where: { classId: id } });
    await this.prisma.class.delete({ where: { id } });

    return { success: true };
  }
}
