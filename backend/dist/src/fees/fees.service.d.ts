import { PrismaService } from "../prisma/prisma.service";
export declare class FeesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(classId?: number, paidStatus?: string): Promise<{
        fees: ({
            student: {
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
            };
        } & {
            id: number;
            amount: number;
            paid: boolean;
            dueDate: Date;
            paidAt: Date | null;
            studentId: number;
        })[];
        summary: {
            total: number;
            collected: number;
            pending: number;
            rate: number;
        };
    }>;
    markAsPaid(id: number): Promise<{
        student: {
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
        };
    } & {
        id: number;
        amount: number;
        paid: boolean;
        dueDate: Date;
        paidAt: Date | null;
        studentId: number;
    }>;
}
