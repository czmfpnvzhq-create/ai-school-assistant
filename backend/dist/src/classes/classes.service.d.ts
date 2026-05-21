import { PrismaService } from "../prisma/prisma.service";
export declare class ClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        teacher: string;
        createdAt: Date;
        studentCount: number;
        teacherCount: number;
        assignedTeachers: {
            id: number;
            name: string;
            subject: string;
        }[];
    }[]>;
    create(name: string, teacher: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        teacher: string;
    }>;
    update(id: number, name: string, teacher: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        teacher: string;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
