import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NoticesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(title: string, content: string, postedBy: string) {
    return this.prisma.notice.create({
      data: { title, content, postedBy },
    });
  }

  async delete(id: number) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      throw new NotFoundException(`Notice with ID ${id} not found`);
    }
    return this.prisma.notice.delete({ where: { id } });
  }
}
