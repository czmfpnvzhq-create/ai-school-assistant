import { PrismaService } from "../prisma/prisma.service";
export declare class NoticesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        createdAt: Date;
        id: number;
        title: string;
        content: string;
        postedBy: string;
    }[]>;
    create(title: string, content: string, postedBy: string): Promise<{
        createdAt: Date;
        id: number;
        title: string;
        content: string;
        postedBy: string;
    }>;
    delete(id: number): Promise<{
        createdAt: Date;
        id: number;
        title: string;
        content: string;
        postedBy: string;
    }>;
}
