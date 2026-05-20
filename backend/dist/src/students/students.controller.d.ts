import { StudentsService } from './students.service';
export declare class StudentsController {
    private studentsService;
    constructor(studentsService: StudentsService);
    getClasses(): Promise<{
        name: string;
        teacher: string;
        createdAt: Date;
        id: number;
    }[]>;
    findAll(search?: string, className?: string, page?: string, limit?: string): Promise<{
        students: ({
            class: {
                name: string;
                teacher: string;
                createdAt: Date;
                id: number;
            };
        } & {
            name: string;
            createdAt: Date;
            id: number;
            classId: number;
            gradeAvg: number;
            parentEmail: string | null;
            phone: string | null;
            address: string | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        class: {
            name: string;
            teacher: string;
            createdAt: Date;
            id: number;
        };
        gradeAvg: number;
        parentEmail: string | null;
        phone: string | null;
        address: string | null;
        attendanceSummary: {
            present: number;
            absent: number;
            late: number;
            total: number;
            rate: number;
        };
        grades: {
            id: number;
            subject: string;
            score: number;
            examDate: string;
        }[];
        fees: {
            id: number;
            amount: number;
            paid: boolean;
            dueDate: string;
            paidAt: string | null;
        }[];
    }>;
    create(body: any): Promise<{
        class: {
            name: string;
            teacher: string;
            createdAt: Date;
            id: number;
        };
    } & {
        name: string;
        createdAt: Date;
        id: number;
        classId: number;
        gradeAvg: number;
        parentEmail: string | null;
        phone: string | null;
        address: string | null;
    }>;
    update(id: number, body: any): Promise<{
        class: {
            name: string;
            teacher: string;
            createdAt: Date;
            id: number;
        };
    } & {
        name: string;
        createdAt: Date;
        id: number;
        classId: number;
        gradeAvg: number;
        parentEmail: string | null;
        phone: string | null;
        address: string | null;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
