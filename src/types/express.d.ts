import { Role } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                displayName: string;
                email: string;
                lastLogin: Date;
                role: Role;
            };
            swaggerDoc?: any;
        }
    }
}

export {};