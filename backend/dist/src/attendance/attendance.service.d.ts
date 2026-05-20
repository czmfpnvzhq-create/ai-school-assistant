import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getAttendance(dateStr: string, classId: number): Promise<{
        studentId: number;
        studentName: string;
        status: import("@prisma/client").$Enums.AttendanceStatus | null;
    }[]>;
    saveAttendance(records: {
        studentId: number;
        date: string;
        status: AttendanceStatus;
    }[]): Promise<{
        success: boolean;
    }>;
    getReport(fromStr: string, toStr: string, classId?: number): Promise<{
        studentId: number;
        studentName: string;
        className: string;
        present: number;
        absent: number;
        late: number;
        percentage: number;
    }[]>;
}
