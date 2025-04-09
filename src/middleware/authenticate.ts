import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware for authenticating users using JWT token
 * Token is retrieved from signed cookies and verified using JWT_ACCESS_SECRET
 * If verification succeeds, user data is added to the request object
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Function to pass control to the next middleware
 * @returns {void}
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

    if (!JWT_ACCESS_SECRET) {
        console.error("JWT_ACCESS_SECRET is not defined");
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "JWT" });
        return;
    }

    const token = req.signedCookies['JWT'];
    console.log("Authenticating user with token:", token);

    if (!token) {
        console.error("No token provided");
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "JWT" });
        return;
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err: jwt.VerifyErrors | null, user: any) => {
        if (err) {
            console.error("Failed to authenticate user:", err);
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }
        console.log("User authenticated:", user.username);
        console.log("User data:", user);
        req.user = user;
        next();
    });
};


/**
 * Middleware that checks if the user has admin role permissions.
 * 
 * @param {Request} req - Express request object containing the authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 * 
 * @throws {StatusCodes.UNAUTHORIZED} - If user is not authenticated
 * @throws {StatusCodes.FORBIDDEN} - If user is not an admin
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/admin-only', isAuthenticated, isAdmin, adminController.doSomething);
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
        console.error("User not found");
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return;
    }

    if (user.userInfo.userRole !== Role.ADMIN) {
        console.error("User is not an admin");
        res.sendStatus(StatusCodes.FORBIDDEN);
        return;
    }

    next();
}

/**
 * Middleware that verifies if the authenticated user is a registered streamer
 * 
 * This middleware checks the database to confirm whether the current user 
 * has a record in the streamers table, indicating they have streamer status.
 * 
 * @param {Request} req - Express request object containing the authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Asynchronous function that calls next() if authorized
 * 
 * @throws {StatusCodes.UNAUTHORIZED} - If no user is authenticated
 * @throws {StatusCodes.FORBIDDEN} - If user is not registered as a streamer
 * 
 * @example
 * // Usage in a route definition:
 * router.post('/stream', authenticate, isStreamer, streamController.startStream);
 */
export const isStreamer = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        console.error("User not found");
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return;
    }

    const isStreamer = await prisma.streamers.findUnique({
        where: {
            userId: user.userId
        }
    });

    if (!isStreamer) {
        console.error("User is not a streamer");
        res.sendStatus(StatusCodes.FORBIDDEN);
        return;
    }

    next();
}


/**
 * Middleware that ensures a user can only access their own resources
 * 
 * This middleware verifies that the authenticated user is attempting to
 * access their own resources by comparing the username in the request
 * with the username from the authenticated user object.
 * 
 * @param {Request} req - Express request object containing user and userInfo properties
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * 
 * @returns {void} - Calls next() if authorized, or sends appropriate status code if not
 * 
 * @throws {StatusCodes.UNAUTHORIZED} - If no user is authenticated
 * @throws {StatusCodes.FORBIDDEN} - If username in request doesn't match authenticated user
 */
export const checkUserResourceOwnership = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        console.error("User not found");
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return;
    }
    const requestUsername =  (req.userInfoOld) ? req.userInfoOld.username : req.userInfo.username;


    const username = user.userInfo.username;


    if (requestUsername !== username) {
        console.error(`User [${username}] is trying to access ${requestUsername} resources`);
        res.sendStatus(StatusCodes.FORBIDDEN);
        return;
    }

    next();
}