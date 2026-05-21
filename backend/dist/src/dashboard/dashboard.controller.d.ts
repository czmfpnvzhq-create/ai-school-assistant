import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getAdminStats(): Promise<Record<string, unknown> | {
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
            id: number;
            createdAt: Date;
            title: string;
            content: string;
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
            id: number;
            name: string;
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
    getStudentStats(req: any): Promise<{
        student: null;
        recentNotices: {
            id: number;
            createdAt: Date;
            title: string;
            content: string;
            postedBy: string;
        }[];
    } | {
        student: {
            id: number;
            name: string;
            className: string;
            gradeAvg: number;
            attendance: {
                totalDays: number;
                presentDays: number;
                absentDays: number;
                lateDays: number;
                percentage: number;
                records: {
                    date: string;
                    status: import("@prisma/client").$Enums.AttendanceStatus;
                }[];
            };
            recentGrades: {
                id: number;
                subject: string;
                score: number;
                examDate: Date;
            }[];
        };
        recentNotices: {
            id: number;
            createdAt: Date;
            title: string;
            content: string;
            postedBy: string;
        }[];
    }>;
    getParentStats(req: any): Promise<{
        child: null;
        recentNotices: {
            id: number;
            createdAt: Date;
            title: string;
            content: string;
            postedBy: string;
        }[];
    } | {
        child: {
            id: number;
            name: string;
            className: string;
            gradeAvg: number;
            attendance: {
                totalDays: number;
                presentDays: number;
                absentDays: number;
                lateDays: number;
                percentage: number;
                records: {
                    date: string;
                    status: import("@prisma/client").$Enums.AttendanceStatus;
                }[];
            };
            recentGrades: {
                id: number;
                subject: string;
                score: number;
                examDate: Date;
            }[];
            grades: {
                id: number;
                subject: string;
                score: number;
                examDate: Date;
            }[];
            fees: {
                id: number;
                amount: number;
                paid: boolean;
                dueDate: Date;
                paidAt: Date | null;
            }[];
            latestFee: {
                id: number;
                amount: number;
                paid: boolean;
                dueDate: Date;
                paidAt: Date | null;
            } | null;
            feeSummary: {
                total: number;
                paid: number;
                pending: number;
            };
        };
        recentNotices: {
            id: number;
            createdAt: Date;
            title: string;
            content: string;
            postedBy: string;
        }[];
    }>;
}
