import { ClassesService } from "./classes.service";
export declare class ClassesController {
    private classesService;
    constructor(classesService: ClassesService);
    findAll(): Promise<{
        id: number;
        name: string;
        teacher: string;
        createdAt: Date;
        studentCount: number;
        teacherCount: number;
        assignedTeachers: {
            id: number;
            name: string;
            subject: string;
        }[];
    }[]>;
    create(body: {
        name: string;
        teacher: string;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        teacher: string;
    }>;
    update(id: number, body: {
        name: string;
        teacher: string;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        teacher: string;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
