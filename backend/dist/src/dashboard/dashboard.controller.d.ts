import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getAdminStats(): Promise<{
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
        feesCollected: number;
        feesPending: number;
        absentToday: number;
        topStudents: {
            id: number;
            rank: number;
            name: string;
            className: string;
            gradeAvg: number;
        }[];
        recentNotices: {
            createdAt: Date;
            id: number;
            title: string;
            content: string;
            postedBy: string;
        }[];
        attendanceData: {
            name: string;
            rate: number;
        }[];
    }>;
    getTeacherStats(req: any): Promise<{
        teacher: {
            id: number;
            name: string;
            subject: string;
        } | null;
        assignedClass: null;
        totalStudents: number;
        todayAttendanceRate: number;
        classGradeAvg: number;
        students: never[];
        todayAttendance: never[];
        recentGrades: never[];
        todayMarked?: undefined;
    } | {
        teacher: {
            id: number;
            name: string;
            subject: string;
        };
        assignedClass: {
            id: number;
            name: string;
        };
        totalStudents: number;
        todayAttendanceRate: number;
        todayMarked: boolean;
        classGradeAvg: number;
        students: {
            todayStatus: string | null;
            name: string;
            id: number;
            gradeAvg: number;
        }[];
        recentGrades: {
            id: number;
            studentName: string;
            subject: string;
            score: number;
            examDate: Date;
        }[];
        todayAttendance?: undefined;
    }>;
}
