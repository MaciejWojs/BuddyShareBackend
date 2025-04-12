import { Role } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                userInfoId: number;
                userSettingsId: number;
                userInfo: {
                    userInfoId: number;
                    username: string;
                    profilePicture: string;
                    description: string;
                    email: string;
                    isBanned: boolean;
                    createdAt: string | Date;
                    updatedAt: string | Date;
                    userRole: Role;
                };
                userSettings?: {
                    notificationsEnabled: boolean;
                    darkMode: boolean;
                };
            };
            swaggerDoc?: any;
            newAccessToken?: string;
        }
    }
}

export {};