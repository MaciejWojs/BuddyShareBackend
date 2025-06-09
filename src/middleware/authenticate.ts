import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient, Role } from '@prisma/client';
import { Socket } from 'socket.io';

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
    console.log("Authenticate middleware is being executed");
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

    if (!JWT_ACCESS_SECRET) {
        console.error("JWT_ACCESS_SECRET is not defined");
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "JWT" });
        return;
    }

    if (req.newAccessToken) {
        console.warn("New access token generated, skipping authentication middleware");
        return next();
    }

    const token = req.signedCookies['JWT'];
    // console.log("Authenticating user with token:", token);

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
        // console.log("User authenticated:", user.userInfo.username);
        // console.log("User data:", user);
        req.user = user;
        next();
    });
};

/**
 * Middleware for optional user authentication using JWT token
 * Token is retrieved from signed cookies and verified using JWT_ACCESS_SECRET
 * If verification succeeds, user data is added to the request object
 * If token doesn't exist or verification fails, middleware continues without error
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Function to pass control to the next middleware
 * @returns {void}
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
    console.log("Optional authenticate middleware is being executed");
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

    if (!JWT_ACCESS_SECRET) {
        console.error("JWT_ACCESS_SECRET is not defined");
        return next();
    }

    if (req.newAccessToken) {
        console.warn("New access token generated, skipping optionalAuthenticate middleware");
        return next();
    }

    const token = req.signedCookies['JWT'];
    console.log("Optional authenticating with token:", token ? "present" : "absent");

    if (!token) {
        console.log("No token provided, continuing without authentication");
        return next();
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err: jwt.VerifyErrors | null, user: any) => {
        if (err) {
            console.error("Failed to authenticate user:", err);
            // W przypadku błędu weryfikacji tokenu, kontynuujemy bez uwierzytelnienia
            return next();
        }
        console.log("User authenticated:", user.userInfo.username);
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
    console.log("isAdmin middleware is being executed");
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
export const checkUserResourceOwnership = (req: Request, res: Response, next: NextFunction): void => {
    console.log("checkUserResourceOwnership middleware is being executed");
    const user = req.user;

    if (!user) {
        console.error("User not authenticated");
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Authentication required to access this resource"
        });
        return;
    }

    // Get the requested username from request, handling both property formats
    const requestUsername = req.userInfo?.username || req.userInfoOld?.username;
    const authenticatedUsername = user.userInfo.username;

    if (!requestUsername) {
        console.error("Request is missing username information");
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Username information is missing from request"
        });
        return;
    }

    if (requestUsername !== authenticatedUsername) {
        console.error(`Access denied: User '${authenticatedUsername}' attempted to access resources of user '${requestUsername}'`);
        res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "You don't have permission to access this resource"
        });
        return;
    }

    next();
}

/**
 * Middleware that attempts to refresh the access token when it's expired
 * 
 * This middleware runs before authenticate to try to refresh an expired token
 * automatically, providing a seamless user experience.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export const tokenRefresher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Token refresher middleware is being executed");
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
        console.error("JWT secrets are not defined");
        return next();
    }

    const accessToken = req.signedCookies['JWT'];
    const refreshToken = req.signedCookies['refresh_token'];
    console.log("Tokens found - Access:", !!accessToken, "Refresh:", !!refreshToken);

    // If both tokens are missing, proceed
    if (!accessToken && !refreshToken) {
        console.log("No tokens found, proceeding to next middleware");
        return next();
    }

    // If access token exists and is valid, proceed
    if (accessToken) {
        try {
            // console.log("Attempting to verify access token");
            jwt.verify(accessToken, JWT_ACCESS_SECRET);
            // console.log("Access token is valid, proceeding to next middleware");
            return next();
        } catch (error) {
            if (!(error instanceof jwt.TokenExpiredError)) {
                console.error("Access token verification failed with non-expiry error:", error);
                return next();
            }
            // console.log("Access token expired, proceeding to refresh process");
        }
    }

    // If we get here, either access token is missing or expired, so try refresh
    if (!refreshToken) {
        // console.log("No refresh token available");
        return next();
    }

    try {
        // console.log("Verifying refresh token");
        const decodedRefreshToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
            userId: number;
            tokenVersion: number;
        };
        // console.log("Refresh token decoded successfully for user:", decodedRefreshToken.userId);

        // console.log("Checking refresh token in database");
        const tokenRecord = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                invalidated: false,
                userId: decodedRefreshToken.userId
            }
        });
        // console.log("Token record found:", !!tokenRecord);

        if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
            // console.log("Token record invalid or expired");
            return next();
        }

        // console.log("Fetching user data for ID:", decodedRefreshToken.userId);
        const user = await prisma.users.findUnique({
            where: { userId: decodedRefreshToken.userId },
            include: {
                userInfo: true,
                userSettings: {
                    select: {
                        userSettingsId: true,
                        notificationsEnabled: true,
                        darkMode: true,
                    }
                }
            }
        });

        if (!user) {
            // console.log("User not found in database");
            return next();
        }
        // console.log("User data retrieved successfully");

        // console.log("Generating new access token");
        const newAccessToken = jwt.sign(user, JWT_ACCESS_SECRET, { expiresIn: "15m" });
        // console.log("New access token generated successfully");

        // console.log("Setting new access token cookie");
        res.cookie('JWT', newAccessToken, {
            signed: true,
            httpOnly: true,
            secure: true,
            maxAge: 15 * 60 * 1000
        });

        req.user = user;
        req.newAccessToken = newAccessToken;
        // console.log("Token refresh completed successfully");

        return next();
    } catch (err) {
        console.error("Token refresh failed with error:", err);
        return next();
    }
};

/**
 * Socket.IO middleware for authenticating users using JWT token.
 * Extracts token from handshake auth or cookies, verifies it, and attaches user data to socket.
 *
 * @param {Socket} socket - The Socket.IO socket object
 * @param {(err?: Error) => void} next - Callback to pass control to the next middleware
 * @returns {void}
 *
 * @throws {Error} If authentication fails or JWT secret is missing
 *
 * @example
 * // Usage in Socket.IO server:
 * io.use(socketAuthMiddleware);
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    console.warn("Socket authentication middleware is being executed");
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
    
    if (!JWT_ACCESS_SECRET) {
        console.error("JWT_ACCESS_SECRET is not defined");
        return next(new Error('Server configuration error'));
    }
    
    // Get token from auth or cookie
    let token = socket.handshake.auth.token;
    
    // If no token in auth, try to extract from cookies
    if (!token && socket.handshake.headers.cookie) {
        const cookie = require('cookie');
        const cookieStr = socket.handshake.headers.cookie;
        const parsedCookies = cookie.parse(cookieStr);
        
        if (parsedCookies.JWT) {
            // Format token: s:JWT.SIGNATURE
            const rawToken = parsedCookies.JWT;
            // console.log("Socket token found:", rawToken);
            
            if (rawToken.startsWith('s:')) {
                // Extract the actual JWT part (between 's:' and the last period)
                const tokenParts = rawToken.substring(2).split('.');
                
                // Regular JWT has 3 parts (header.payload.signature)
                if (tokenParts.length >= 3) {
                    // Reconstruct proper JWT format: header.payload.signature
                    token = tokenParts.slice(0, 3).join('.');
                }
            } else {
                token = rawToken;
            }
        }
    }
    
    if (!token) {
        console.error("No authentication token provided");
        return next(new Error('Authentication error'));
    }
    
    try {
        console.warn("Verifying socket token");
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
        socket.data.user = decoded;
        console.warn("Socket token verified successfully");
        next();
    } catch (err) {
        console.error("Socket token verification failed:", err);
        next(new Error('Authentication error'));
    }
};