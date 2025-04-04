import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware that checks if a user exists in the database.
 * 
 * This middleware looks for the username in both req.params and req.body.
 * If no username is provided, it returns a BAD_REQUEST response.
 * If the user doesn't exist in the database, it returns a NOT_FOUND response.
 * If the user exists, it attaches the user info to the request object and calls next().
 * 
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @param {NextFunction} next - The Express next function
 * 
 * @returns {Promise<void>} A promise that resolves when the middleware completes
 * 
 * @throws {Error} If there's an error checking if the user exists, it will return an INTERNAL_SERVER_ERROR
 */
export const userExistsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const username = req.params.username || req.body.username;

        if (!username) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Username is required'
            });
            return
        }

        const user = await prisma.usersInfo.findUnique({
            where: {
                username: username
            },
            
            include: {
                user: {
                    select: {
                        userId: true,
                    }
                }
            }
        });

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: `User ${username} not found`
            });
            return
        }

        req.userInfo = user;
        next();
    } catch (error) {
        console.error(`Error checking if user exists: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error checking if user exists'
        });
    }
}