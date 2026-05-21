import { PrismaService } from "../prisma/prisma.service";
export declare class NoticesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        content: string;
        postedBy: string;
    }[]>;
    create(title: string, content: string, postedBy: string): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        content: string;
        postedBy: string;
    }>;
    delete(id: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        content: string;
        postedBy: string;
    }>;
}
