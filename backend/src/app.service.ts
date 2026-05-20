import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const studentCount = await this.prisma.student.count();
    return `Hello World! Database is connected. Student count: ${studentCount}`;
  }
}
