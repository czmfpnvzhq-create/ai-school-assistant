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
            name: string;
            id: number;
            subject: string;
        }[];
    }[]>;
    create(body: {
        name: string;
        teacher: string;
    }): Promise<{
        name: string;
        teacher: string;
        createdAt: Date;
        id: number;
    }>;
    update(id: number, body: {
        name: string;
        teacher: string;
    }): Promise<{
        name: string;
        teacher: string;
        createdAt: Date;
        id: number;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
