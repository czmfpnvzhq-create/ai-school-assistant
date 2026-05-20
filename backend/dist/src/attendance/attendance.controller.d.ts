import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private attendanceService;
    constructor(attendanceService: AttendanceService);
    getAttendance(date: string, classId: string): Promise<{
        studentId: number;
        studentName: string;
        status: import("@prisma/client").$Enums.AttendanceStatus | null;
    }[]>;
    saveAttendance(body: {
        records: any[];
    }): Promise<{
        success: boolean;
    }>;
    getReport(from: string, to: string, classId?: string): Promise<{
        studentId: number;
        studentName: string;
        className: string;
        present: number;
        absent: number;
        late: number;
        percentage: number;
    }[]>;
}
