import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getClasses(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        teacher: string;
    }[]>;
    findAll(search?: string, className?: string, page?: number, limit?: number): Promise<{
        students: ({
            class: {
                id: number;
                name: string;
                createdAt: Date;
                teacher: string;
            };
        } & {
            id: number;
            name: string;
            createdAt: Date;
            classId: number;
            gradeAvg: number;
            parentEmail: string | null;
            phone: string | null;
            address: string | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        class: {
            id: number;
            name: string;
            createdAt: Date;
            teacher: string;
        };
        gradeAvg: number;
        parentEmail: string | null;
        phone: string | null;
        address: string | null;
        attendanceSummary: {
            present: number;
            absent: number;
            late: number;
            total: number;
            rate: number;
        };
        grades: {
            id: number;
            subject: string;
            score: number;
            examDate: string;
        }[];
        fees: {
            id: number;
            amount: number;
            paid: boolean;
            dueDate: string;
            paidAt: string | null;
        }[];
    }>;
    create(body: any): Promise<{
        class: {
            id: number;
            name: string;
            createdAt: Date;
            teacher: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        classId: number;
        gradeAvg: number;
        parentEmail: string | null;
        phone: string | null;
        address: string | null;
    }>;
    update(id: number, body: any): Promise<{
        class: {
            id: number;
            name: string;
            createdAt: Date;
            teacher: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        classId: number;
        gradeAvg: number;
        parentEmail: string | null;
        phone: string | null;
        address: string | null;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
