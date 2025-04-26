import { Request, Response, NextFunction } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

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