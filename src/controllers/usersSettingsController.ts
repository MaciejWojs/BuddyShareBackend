import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();
/**
 * Fetches user settings for the authenticated user.
 * 
 * @async
 * @function getUserSettings
 * @param {Request} req - Express request object containing the authenticated user information in req.userInfo
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Sends a JSON response with user settings or error message
 * 
 * @throws Will throw an error if database operations fail
 * 
 * @example
 * // Route implementation
 * router.get('/settings', authenticate, getUserSettings);
 */
export const getUserSettings = async (req: Request, res: Response) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                userSettingsId: req.userInfo.userInfoId
            }
        });
        const userSettings = await prisma.userSettings.findUnique({
            where: {
                userSettingsId: user?.userSettingsId
            }
        });
        if (!userSettings) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User settings not found'
            });
            return;
        }
        const { passwordHash, ...userSettingsWithoutPassword } = userSettings;
        res.status(StatusCodes.OK).json({
            ...userSettingsWithoutPassword
        });
    } catch (error: any) {
        console.error(`Error fetching user settings: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching user settings'
        });
    }
}

/**
 * Updates user settings for the authenticated user.
 * 
 * @async
 * @function updateUserSettings
 * @param {Request} req - Express request object containing the authenticated user information in req.userInfo
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Sends a JSON response with updated user settings or error message
 * 
 * @throws Will throw an error if database operations fail
 * 
 * @example
 * // Route implementation
 * router.put('/settings', authenticate, updateUserSettings);
 */
export const updateUserSettings = async (req: Request, res: Response) => {
    
}