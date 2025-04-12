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
    console.log("getUserSettings endpoint reached");
    try {
        const settings = req.user?.userSettings;
        console.log("user settings", settings);
        res.status(StatusCodes.OK).json(
            
            // ...userSettingsWithoutPassword
            settings
        );
        return;
    } catch (error: any) {
        console.error(`Error fetching user settings: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching user settings'
        });
        return;
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