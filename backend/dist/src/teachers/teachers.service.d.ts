import { PrismaService } from "../prisma/prisma.service";
export declare class TeachersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        class: {
            id: number;
            name: string;
            createdAt: Date;
            teacher: string;
        } | null;
    } & {
        id: number;
        email: string;
        name: string;
        createdAt: Date;
        subject: string;
        classId: number | null;
    })[]>;
    create(body: any): Promise<{
        class: {
            id: number;
            name: string;
            createdAt: Date;
            teacher: string;
        } | null;
    } & {
        id: number;
        email: string;
        name: string;
        createdAt: Date;
        subject: string;
        classId: number | null;
    }>;
    update(id: number, body: any): Promise<{
        class: {
            id: number;
            name: string;
            createdAt: Date;
            teacher: string;
        } | null;
    } & {
        id: number;
        email: string;
        name: string;
        createdAt: Date;
        subject: string;
        classId: number | null;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
