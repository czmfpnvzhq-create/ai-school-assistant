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
            name: string;
            id: number;
            subject: string;
        }[];
    }[]>;
    create(name: string, teacher: string): Promise<{
        name: string;
        teacher: string;
        createdAt: Date;
        id: number;
    }>;
    update(id: number, name: string, teacher: string): Promise<{
        name: string;
        teacher: string;
        createdAt: Date;
        id: number;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
