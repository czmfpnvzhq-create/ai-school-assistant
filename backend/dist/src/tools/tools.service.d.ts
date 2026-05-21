import { PrismaService } from '../prisma/prisma.service';
export declare class ToolsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getClassOrError;
    executeTool(toolName: string, toolArgs: any): Promise<{
        id: number;
        name: string;
        gradeAvg: number;
    }[] | {
        studentName: string;
        className: string;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        date: string;
    }[] | {
        rank: number;
        name: string;
        gradeAvg: number;
    }[] | {
        id: number;
        title: string;
        postedBy: string;
        date: string;
    }[] | {
        error: string;
        success?: undefined;
        data?: undefined;
        message?: undefined;
        student?: undefined;
        className?: undefined;
        totalStudents?: undefined;
        averageGrade?: undefined;
        totalFees?: undefined;
        collectedAmount?: undefined;
        pendingAmount?: undefined;
        pendingRecords?: undefined;
        collectionRatePercent?: undefined;
    } | {
        success: boolean;
        data: never[];
        message: string;
        error?: undefined;
        student?: undefined;
        className?: undefined;
        totalStudents?: undefined;
        averageGrade?: undefined;
        totalFees?: undefined;
        collectedAmount?: undefined;
        pendingAmount?: undefined;
        pendingRecords?: undefined;
        collectionRatePercent?: undefined;
    } | {
        success: boolean;
        student: {
            id: number;
            name: string;
            className: string;
        };
        error?: undefined;
        data?: undefined;
        message?: undefined;
        className?: undefined;
        totalStudents?: undefined;
        averageGrade?: undefined;
        totalFees?: undefined;
        collectedAmount?: undefined;
        pendingAmount?: undefined;
        pendingRecords?: undefined;
        collectionRatePercent?: undefined;
    } | {
        className: string;
        totalStudents: number;
        averageGrade: number;
        error?: undefined;
        success?: undefined;
        data?: undefined;
        message?: undefined;
        student?: undefined;
        totalFees?: undefined;
        collectedAmount?: undefined;
        pendingAmount?: undefined;
        pendingRecords?: undefined;
        collectionRatePercent?: undefined;
    } | {
        totalFees: number;
        collectedAmount: number;
        pendingAmount: number;
        pendingRecords: number;
        collectionRatePercent: number;
        error?: undefined;
        success?: undefined;
        data?: undefined;
        message?: undefined;
        student?: undefined;
        className?: undefined;
        totalStudents?: undefined;
        averageGrade?: undefined;
    }>;
}
