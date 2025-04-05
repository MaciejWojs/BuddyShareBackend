import { Request, Response, NextFunction } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

// Extend the Request type
declare global {
    namespace Express {
        interface Request {
            isModerator?: boolean;
            moderator?: any;
            isStreamerModerator?: boolean;
            streamer?: any;
        }
    }
}

const prisma = new PrismaClient();

/**
 * Middleware that checks if a user is a moderator
 * 
 * This middleware verifies if the specified user exists in the moderators table.
 * It extracts the moderator's username from request parameters or body and performs
 * a database lookup. If found, the moderator information is attached to the request object.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Asynchronous function that calls next() if successful
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If moderator username is not provided
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @modifies {req.isModerator} - Sets to true if user is a moderator, false otherwise
 * @modifies {req.moderator} - Attaches moderator object if user is a moderator
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/mod-action', isModerator, moderatorController.performAction);
 */
export const isModerator = async (req: Request, res: Response, next: NextFunction) => {
    console.log("IsModerator middleware is being executed");
    const moderatorUsername = req.params.modusername || req.body.modusername;

    if (!moderatorUsername) {
        console.log("moderator username not found");
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    try {
        const moderator = await prisma.moderators.findFirst({
            where: {
                user: {
                    userInfo: {
                        username: moderatorUsername,
                    }
                }
            }
        });

        req.isModerator = !!moderator;
        if (moderator) req.moderator = moderator;
        next();
    } catch (error) {
        console.error(`Error checking if moderator exists: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error checking if moderator exists'
        });
    }
}

/**
 * Middleware that checks if a user is a moderator for a specific streamer
 * 
 * This middleware verifies if the moderator has been assigned to moderate for the
 * specified streamer by checking the streamModerators relationship table.
 * It requires req.isModerator to be set by the isModerator middleware before running.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Asynchronous function that calls next() if successful
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If streamer or moderator username is not provided
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @modifies {req.isStreamerModerator} - Sets to true if user is a moderator for the streamer
 * @modifies {req.streamerModerator} - Attaches streamerModerator object if relationship exists
 * 
 * @example
 * // Usage in a route definition:
 * router.delete('/stream/:streamerId/comment/:commentId', authenticate, isModerator, isStreamerModerator, moderationController.deleteComment);
 */
export const isStreamerModerator = async (req: Request, res: Response, next: NextFunction) => {
    console.log("isStreamerModerator middleware is being executed");
    const streamer = req.streamer || req.body.streamer;
    const moderatorUsername = req.params.modusername || req.body.modusername;

    // Set default value
    req.isStreamerModerator = false;

    if (!streamer || !moderatorUsername) {
        console.log("streamer or moderator username not found");
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    // If not a moderator, move to next middleware
    if (!req.isModerator) {
        return next();
    }

    try {
        const streamerModerator = await prisma.streamModerators.findFirst({
            where: {
                moderatorId: req.moderator.moderatorId,
                streamerId: streamer.streamerId
            },
            include: {
                moderator: {
                    include: {
                        user: {
                            include: {
                                userInfo: true
                            }
                        }
                    }
                }
            }
        });

        req.isStreamerModerator = !!streamerModerator;
        if (req.isStreamerModerator) req.streamerModerator = streamerModerator;

        next();
    } catch (error) {
        console.error(`Error checking streamer moderator status: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error checking streamer moderator status'
        });
    }
}
