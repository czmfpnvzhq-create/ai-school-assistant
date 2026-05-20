import { GradesService } from "./grades.service";
export declare class GradesController {
    private gradesService;
    constructor(gradesService: GradesService);
    getGrades(classId: string, subject: string, examDate: string): Promise<{
        studentId: number;
        studentName: string;
        score: number | null;
    }[]>;
    saveGrades(body: {
        grades: any[];
    }): Promise<{
        success: boolean;
    }>;
    getGradesReport(classId?: string, subject?: string): Promise<{
        rank: number;
        studentId: number;
        studentName: string;
        className: string;
        subject: string;
        score: number;
        gradeLetter: string;
        examDate: string;
    }[]>;
}
