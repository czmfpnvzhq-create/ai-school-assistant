import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

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

  async create(body: any) {
    const { name, email, subject, classId } = body;

    if (!name || !email || !subject) {
      throw new BadRequestException("Name, Email, and Subject are required");
    }

    // Check if teacher exists
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { email },
    });
    if (existingTeacher) {
      throw new BadRequestException("Teacher with this email already exists");
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash("teacher123", 10);

    return this.prisma.$transaction(async (tx) => {
      // Create user login credential
      await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "TEACHER",
        },
      });

      // Create teacher record
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

  async update(id: number, body: any) {
    const { name, email, subject, classId } = body;

    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    if (email && email !== teacher.email) {
      // Check if email already in use
      const existingTeacher = await this.prisma.teacher.findUnique({
        where: { email },
      });
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingTeacher || existingUser) {
        throw new BadRequestException("Email is already in use by another user");
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

      // Sync corresponding User if it exists
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

  async delete(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete teacher record
      await tx.teacher.delete({
        where: { id },
      });

      // Delete corresponding user record if exists
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
}
