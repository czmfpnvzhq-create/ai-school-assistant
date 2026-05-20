import { TeachersService } from "./teachers.service";
export declare class TeachersController {
    private teachersService;
    constructor(teachersService: TeachersService);
    findAll(): Promise<({
        class: {
            name: string;
            teacher: string;
            createdAt: Date;
            id: number;
        } | null;
    } & {
        name: string;
        createdAt: Date;
        id: number;
        email: string;
        subject: string;
        classId: number | null;
    })[]>;
    create(body: any): Promise<{
        class: {
            name: string;
            teacher: string;
            createdAt: Date;
            id: number;
        } | null;
    } & {
        name: string;
        createdAt: Date;
        id: number;
        email: string;
        subject: string;
        classId: number | null;
    }>;
    update(id: number, body: any): Promise<{
        class: {
            name: string;
            teacher: string;
            createdAt: Date;
            id: number;
        } | null;
    } & {
        name: string;
        createdAt: Date;
        id: number;
        email: string;
        subject: string;
        classId: number | null;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
