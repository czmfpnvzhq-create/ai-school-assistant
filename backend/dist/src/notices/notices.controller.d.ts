import { NoticesService } from "./notices.service";
export declare class NoticesController {
    private noticesService;
    constructor(noticesService: NoticesService);
    findAll(): Promise<{
        createdAt: Date;
        id: number;
        title: string;
        content: string;
        postedBy: string;
    }[]>;
    create(body: {
        title: string;
        content: string;
    }, req: any): Promise<{
        createdAt: Date;
        id: number;
        title: string;
        content: string;
        postedBy: string;
    }>;
    delete(id: number, req: any): Promise<{
        createdAt: Date;
        id: number;
        title: string;
        content: string;
        postedBy: string;
    }>;
}
