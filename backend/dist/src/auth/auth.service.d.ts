import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(body: any): Promise<{
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(body: any): Promise<{
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
