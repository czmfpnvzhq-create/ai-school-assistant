import { PrismaService } from "../prisma/prisma.service";
export declare class GradesService {
    private prisma;
    constructor(prisma: PrismaService);
    getGrades(classId: number, subject: string, examDateStr: string): Promise<{
        studentId: number;
        studentName: string;
        score: number | null;
    }[]>;
    saveGrades(records: {
        studentId: number;
        subject: string;
        score: number;
        examDate: string;
    }[]): Promise<{
        success: boolean;
    }>;
    getGradesReport(classId?: number, subject?: string): Promise<{
        rank: number;
        studentId: number;
        studentName: string;
        className: string;
        subject: string;
        score: number;
        gradeLetter: string;
        examDate: string;
    }[]>;
    private recalculateStudentGradeAvg;
}
