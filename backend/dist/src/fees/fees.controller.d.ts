import { FeesService } from "./fees.service";
export declare class FeesController {
    private feesService;
    constructor(feesService: FeesService);
    findAll(classId?: string, paidStatus?: string): Promise<{
        fees: ({
            student: {
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
            };
        } & {
            id: number;
            amount: number;
            paid: boolean;
            dueDate: Date;
            paidAt: Date | null;
            studentId: number;
        })[];
        summary: {
            total: number;
            collected: number;
            pending: number;
            rate: number;
        };
    }>;
    pay(id: number): Promise<{
        student: {
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
        };
    } & {
        id: number;
        amount: number;
        paid: boolean;
        dueDate: Date;
        paidAt: Date | null;
        studentId: number;
    }>;
}
