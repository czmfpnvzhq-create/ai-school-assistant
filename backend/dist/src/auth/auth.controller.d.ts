import { AuthService } from './auth.service';
import type { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: any, response: Response): Promise<{
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(body: any, response: Response): Promise<{
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
