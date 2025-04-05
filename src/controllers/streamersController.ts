import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

const prisma = new PrismaClient();

/**
 * Controller function to retrieve all streamers from the database
 * 
 * This function fetches all streamer records along with their associated user information
 * and returns them as a JSON response.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with streamers data
 * 
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamers', getAllStreamers);
 */
export const getAllStreamers = async (req: Request, res: Response) => {
    try {
        const streamers = await prisma.streamers.findMany({
            include: {
                user: {
                    select: { userInfo: true, },
                },
            },
        });

        res.status(StatusCodes.OK).json(streamers);
    } catch (error) {
        console.error('Error fetching streamers:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

/**
 * Controller function to retrieve streamer information by username
 * 
 * This function returns user information for a specified streamer.
 * It relies on middleware to verify the user exists and is a streamer.
 * 
 * @param {Request} req - Express request object with userInfo and streamer properties attached by middleware
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with streamer data
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamer/:username', userExistsMiddleware, isStreamer, getStreamerByUsername);
 */
export const getStreamerByUsername = async (req: Request, res: Response) => {
    // At this point, userExistsMiddleware has verified the user exists
    // and attached the user info to req.userInfo
    // isStreamer middleware has verified the user is a streamer
    // and attached the streamer info to req.streamer
    
    return res.status(StatusCodes.OK).json({
        userInfo: req.userInfo,
        streamer: req.streamer
    });
}

/**
 * Controller function to retrieve all moderators for a specific streamer
 * 
 * This function fetches all moderator records associated with the specified streamer
 * and returns them as a JSON response. It includes the user information for each moderator.
 * The streamer's existence is already verified by previous middleware (userExistsMiddleware, isStreamer).
 * 
 * @param {Request} req - Express request object containing streamer information from middleware
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with moderators data
 * 
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamers/:username/moderators', userExistsMiddleware, isStreamer, getStreamerModerators);
 */
export const getStreamerModerators = async (req: Request, res: Response) => {
    // The middleware (userExistsMiddleware and isStreamer) has already validated
    // that the streamer exists and attached it to req.streamer
    const streamer = req.streamer;
    
    try {
        const moderators = await prisma.streamModerators.findMany({
            where: {
                streamerId: streamer.streamerId,
            },
            include: {
                moderator: {
                    select: {
                        user: {
                            select: {
                                userInfo: true,
                            },
                        }
                    }
                },
            }
        });

        res.status(StatusCodes.OK).json(moderators);
    } catch (error) {
        console.error('Error fetching moderators:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

/**
 * Controller function to retrieve information about a specific moderator for a streamer
 * 
 * This function fetches information about a specific moderator assigned to the 
 * specified streamer by their username.
 * 
 * @param {Request} req - Express request object containing streamer and moderator information
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with moderator data
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If streamer or moderator username is not provided
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamers/:username/moderators/:modusername', userExists, isStreamer, getStreamerModeratorByUsername);
 */
export const getStreamerModeratorByUsername = async (req: Request, res: Response) => {
    // The middleware (userExistsMiddleware, isStreamer, isModerator, isStreamerModerator) 
    // has already validated that the streamer exists and attached it to req.streamer
    // and validated the moderator username
    console.log("Atempting to get streamer moderator by username");
    // If we reach this point, moderator relationship exists and is in req.streamerModerator
    if (req.isStreamerModerator && req.streamerModerator) {
        return res.status(StatusCodes.OK).json(req.streamerModerator);
    }

    // If the moderator exists but is not assigned to this streamer
    if (req.isModerator && !req.isStreamerModerator) {
        return res.status(StatusCodes.NOT_FOUND).json({
            message: `Moderator is not assigned to this streamer`
        });
    }

    // This is a fallback in case middleware chain is incomplete
    return res.status(StatusCodes.NOT_FOUND).json({
        message: ReasonPhrases.NOT_FOUND
    });
}

/**
 * Controller function to add a moderator to a streamer's moderator team
 * 
 * This function adds a specified user as a moderator for a streamer.
 * If the user is not already a moderator, it creates a new moderator record.
 * Then it creates a relationship between the streamer and the moderator.
 * 
 * @param {Request} req - Express request object containing streamer and moderator information
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with updated moderators list
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If required middleware hasn't been executed or parameters are missing
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database operations fail
 * 
 * @example
 * // Usage in a route definition:
 * router.post('/streamers/:username/moderators/:modusername', userExists, isStreamer, isModerator, isStreamerModerator, addStreamerModerator);
 */
export const addStreamerModerator = async (req: Request, res: Response) => {
    console.log("req.method: ", req.method);
    const streamerREQ = req.streamer || req.body.streamer;
    let streamerModerator = req.streamerModerator;
    let moderator = req.moderator;
    const isModerator = req.isModerator;
    const isStreamerModerator = req.isStreamerModerator;
    const streamerUsername = req.params.username || req.body.username;
    const moderatorUsername = req.params.modusername || req.body.modusername;

    if (isStreamerModerator === undefined) {
        console.error("isStreamerModerator not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (isModerator === undefined) {
        console.error("isModerator not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (streamerREQ === undefined) {
        console.error("isStreamer not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (!streamerUsername || !moderatorUsername) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (streamerModerator && isStreamerModerator) {
        console.log("streamerModerator: ", streamerModerator);
        console.log("isStreamerModerator: ", isStreamerModerator);
        console.log(`${moderatorUsername} is already a ${streamerUsername} moderator`);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    const tempUser = await prisma.usersInfo.findUnique({
        where: {
            username: moderatorUsername,
        }
    })

    if(!tempUser) {
        console.log("There is no user called", moderatorUsername);
        return res.status(StatusCodes.NOT_FOUND).json({ message: ReasonPhrases.NOT_FOUND });
    }

    if (!isModerator && !moderator) {
        moderator = await prisma.moderators.create({

            data: {
                userId: tempUser!!.userInfoId,

            },
        });
        console.log("Moderator created: ", moderator);
    };

    // res.status(StatusCodes.OK).json(moderator);

    if (!streamerModerator && !isStreamerModerator) {
        streamerModerator = await prisma.streamModerators.create({
            data: {
                streamerId: streamerREQ.streamerId,
                moderatorId: moderator.moderatorId,
            },
        });
        console.log("streamerModerator created: ", streamerModerator);

    };

    try {
        const moderators = await prisma.streamModerators.findMany({
            where: {
                streamerId: streamerREQ.streamerId,
            },
            include: {
                moderator: {
                    select: {
                        user: {
                            select: {
                                userInfo: true,
                            },
                        }
                    }
                },
            }
        });

        console.log("MODERATORS-FINAL: ", moderators);
        res.status(StatusCodes.OK).json(moderators);
    } catch (error) {
        console.error('Error fetching moderators:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

/**
 * Controller function to delete a moderator from a streamer's moderator team
 * 
 * This function removes the specified moderator from the streamer's moderator team
 * by deleting the relationship record in the streamModerators table.
 * 
 * @param {Request} req - Express request object containing streamer and moderator information
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with updated moderators list
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If required middleware hasn't been executed or parameters are missing
 * @throws {StatusCodes.NOT_FOUND} - If the moderator record cannot be found
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database operations fail
 * 
 * @example
 * // Usage in a route definition:
 * router.delete('/streamers/:username/moderators/:modusername', userExists, isStreamer, isModerator, isStreamerModerator, deleteStreamerModerator);
 */
export const deleteStreamerModerator = async (req: Request, res: Response) => {
    console.log("req.method: ", req.method);
    const streamerREQ = req.streamer || req.body.streamer;
    let streamerModerator = req.streamerModerator;
    let moderator = req.moderator;
    const isModerator = req.isModerator;
    const isStreamerModerator = req.isStreamerModerator;
    const streamerUsername = req.params.username || req.body.username;
    const moderatorUsername = req.params.modusername || req.body.modusername;

    if (isStreamerModerator === undefined) {
        console.error("isStreamerModerator not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (isModerator === undefined) {
        console.error("isModerator not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (streamerREQ === undefined) {
        console.error("isStreamer not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (!streamerUsername || !moderatorUsername) {
        console.log("streamer: ", streamerUsername);
        console.log("moderator: ", moderatorUsername);
        console.log("streamer or moderator username not found");
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (!isModerator && !moderator) {
        console.log(`${moderatorUsername} is not a moderator`);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (!streamerModerator && !isStreamerModerator) {
        console.log(`${moderatorUsername} is not a ${streamerUsername} moderator`);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (streamerModerator && isStreamerModerator) {
        console.log(`${moderatorUsername} found as ${streamerUsername} moderator, deleting...`);

        try {
            // First find the record to get its unique ID
            const moderatorRecord = await prisma.streamModerators.findFirst({
                where: {
                    streamerId: streamerREQ.streamerId,
                    moderatorId: streamerModerator.moderatorId,
                },
            });

            console.log("MODERATOR-RECORD: ", moderatorRecord);

            if (!moderatorRecord) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Moderator record not found" });
            }

            await prisma.streamModerators.delete({
                where: {
                    streamModeratorId: moderatorRecord.streamModeratorId,
                },
            });

            const moderators = await prisma.streamModerators.findMany({
                where: {
                    streamerId: streamerREQ.streamerId,
                },
                include: {
                    moderator: {
                        select: {
                            user: {
                                select: {
                                    userInfo: true,
                                },
                            }
                        }
                    },
                }
            });

            console.log("MODERATORS-FINAL: ", moderators);
            return res.status(StatusCodes.OK).json(moderators);
        } catch (error) {
            console.error('Error deleting moderator:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
        }
    }
}