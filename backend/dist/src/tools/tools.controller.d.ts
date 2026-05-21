import { ToolsService } from './tools.service';
export declare class ToolsController {
    private toolsService;
    constructor(toolsService: ToolsService);
    executeTool(body: {
        toolName: string;
        toolArgs: any;
    }): Promise<{
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
