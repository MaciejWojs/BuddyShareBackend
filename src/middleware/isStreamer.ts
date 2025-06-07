import { Request, Response, NextFunction } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';
import { streamBlockCache } from '../controllers/streamController';
import { sql } from 'bun';

declare global {
    namespace Express {
        interface Request {
            token?: string;
        }
    }
}

const prisma = new PrismaClient();

/**
 * Middleware that verifies if a user exists and is a streamer
 * 
 * This middleware checks if the user identified by the username parameter
 * exists in the database and has a record in the streamers table.
 * It requires userInfo to be set by a preceding middleware.
 * 
 * @param {Request} req - Express request object with userInfo property containing user data
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Asynchronous function that calls next() if user is a streamer
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If username is not provided or userInfo is undefined
 * @throws {StatusCodes.NOT_FOUND} - If user is not registered as a streamer
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @modifies {req.streamer} - Attaches streamer object to the request
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamer/:username/details', userExists, isStreamer, streamerController.getDetails);
 */
export const isStreamer = async (req: Request, res: Response, next: NextFunction) => {
    console.log("isStreamer middleware is being executed");
    try {
        const username = req.params.username || req.body.username;

        if (!username) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Username is required'
            });
            return
        }
        if (req.userInfo === undefined) {
            console.error("userExistsMiddleware not executed, navigating to", req.originalUrl);
            res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
            return
        }

        // const user = await prisma.users.findUnique({
        //     where: {
        //         userId : req.userInfo.userId
        //     }
        // });
        // console.log("USERINFO: ", req.userInfo);
        const streamer = await prisma.streamers.findUnique({
            where: {
                userId: req.userInfo.user.userId

            },
            include: {
                user: {
                    include: {
                        userInfo: true
                    }
                }
            }
        });
        if (!streamer) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: ReasonPhrases.NOT_FOUND
            });
            return
        }

        req.streamer = streamer;
        // console.log("Streamer found: ", streamer);
        next();
    } catch (error) {
        console.error(`Error checking if user exists: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

/**
 * Middleware that checks if a token is provided in the request query
 * 
 * This middleware checks if a token is present in the request query parameters.
 * If the token is not provided, it sends a 400 Bad Request response.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Asynchronous function that calls next() if token is present
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If token is not provided
 */
export const hasStreamerToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.query["name"];
    console.log("hasStreamerToken middleware is being executed");
    console.log("Token: ", token);
    if (!token) {
        console.error("No token provided");
        res.status(StatusCodes.BAD_REQUEST).json(StatusCodes.BAD_REQUEST);
        return;
    }
    req.token = token as string;
    next();
}

/**
 * Middleware that checks if a token is valid
 * 
 * This middleware checks if the provided token is valid by querying the database.
 * If the token is valid, it attaches the streamer object to the request and calls next().
 * If the token is invalid, it sends a 401 Unauthorized response.
 * 
 * @param {Request} req - Express request object with token property
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Asynchronous function that calls next() if token is valid
 * 
 * @throws {StatusCodes.UNAUTHORIZED} - If token is invalid
 */
export const isValidStreamerToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.token;
    console.log("isValidStreamerToken middleware is being executed");
    if (!token) {
        console.error("hasStreamerToken middleware not executed!");
        res.status(StatusCodes.UNAUTHORIZED).json(StatusCodes.UNAUTHORIZED);
        return;
    }

    try {
        const streamer = await prisma.streamers.findUnique({
            where: {
                token: token
            },
            include: {
                user: {
                    include: {
                        userInfo: true
                    }
                }
            }
        });
        if (!streamer) {
            console.error("Unauthorized access - invalid token, from ip: ", req.ip);
            res.status(StatusCodes.UNAUTHORIZED).json(StatusCodes.UNAUTHORIZED);
            return;
        }
        req.streamer = streamer;
        next();
    } catch (error) {
        console.error(`Error checking if token is valid: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

/**
 * Opcjonalne middleware: jeśli użytkownik jest streamerem, ustawia req.streamer,
 * jeśli nie – ustawia req.streamer na null i przechodzi dalej.
 */
export const attachStreamerIfExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const username = req.params.username || req.body.username;
        if (!username || !req.userInfo) {
            req.streamer = null;
            return next();
        }

        const streamer = await prisma.streamers.findUnique({
            where: {
                userId: req.userInfo.user.userId
            },
            include: {
                user: {
                    include: {
                        userInfo: true
                    }
                }
            }
        });

        req.streamer = streamer || null;
        next();
    } catch (error) {
        console.error(`Error in attachStreamerIfExists: ${error}`);
        req.streamer = null;
        next();
    }
}

export const IsNotBanned = async (req: Request, res: Response, next: NextFunction) => {
    console.log("IsNotTemporaryBanned middleware is being executed");
    const streamKey = req.token || req.query["name"];
    const blockedUntil = streamBlockCache.get(streamKey as string);

    const streamerUserId = req.streamer.user.userId;
    const isBanned = await sql`SELECT "isBanned" FROM "users_info" WHERE "id" = ${streamerUserId};`

    if (isBanned[0].isBanned) {
        console.log(`🚫 Streamer with userId ${streamerUserId} is banned`);
        res.status(403).send('Streamer is banned');
        return;
    }

    if (blockedUntil && Date.now() < blockedUntil) {
        console.log(`🚫 Stream "${streamKey}" zablokowany do ${new Date(blockedUntil).toISOString()}`);
        res.status(403).send('Stream blocked');
        return
    } else {
        for (const [key, value] of streamBlockCache.entries()) {
            if (value < Date.now()) {
                console.log(`Removing expired block for stream "${key}"`);
                streamBlockCache.delete(key);
            }
        }
    }
    next();
}

/**
 * Middleware that checks if a streamer is already live
 *
 * This middleware checks if the streamer is already live by querying the database.
 * If the streamer is live, it sends a 400 Bad Request response.
 * If the streamer is not live, it calls the next middleware.
 *
 * @param {Request} req - Express request object with streamer information
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Asynchronous function that calls next() if streamer is not live
 *
 * @throws {StatusCodes.BAD_REQUEST} - If streamer is already live
 */
export const isNotAlreadyStreaming = async (req: Request, res: Response, next: NextFunction) => {
    const streamerId = req.streamer.streamerId;
    const username = req.streamer.user.userInfo.username;

    const [{ count }] = await sql`
        SELECT COUNT(*) AS count
          FROM streams s
          JOIN stream_options o ON s.options_id = o.id
         WHERE s.streamer_id = ${streamerId}
           AND o."isLive" = TRUE
      `;
    if (count > 0) {
        console.log(`${username} is already live`);
        res.status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Streamer is already live' });
        return;
    }
    next();
}