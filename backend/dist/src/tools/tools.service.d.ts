import { PrismaService } from '../prisma/prisma.service';
export declare class ToolsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getClassOrError;
    executeTool(toolName: string, toolArgs: any): Promise<{
        name: string;
        id: number;
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
        error: string;
        success?: undefined;
        data?: undefined;
        message?: undefined;
        student?: undefined;
        className?: undefined;
        totalStudents?: undefined;
        averageGrade?: undefined;
    } | {
        success: boolean;
        data: never[];
        message: string;
        error?: undefined;
        student?: undefined;
        className?: undefined;
        totalStudents?: undefined;
        averageGrade?: undefined;
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
    } | {
        className: string;
        totalStudents: number;
        averageGrade: number;
        error?: undefined;
        success?: undefined;
        data?: undefined;
        message?: undefined;
        student?: undefined;
    }>;
}
