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
        console.log("User authenticated:", user.userInfo.username);
        console.log("User data:", user);
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

// /**
//  * Middleware that verifies if the authenticated user is a registered streamer
//  * 
//  * This middleware checks the database to confirm whether the current user 
//  * has a record in the streamers table, indicating they have streamer status.
//  * 
//  * @param {Request} req - Express request object containing the authenticated user
//  * @param {Response} res - Express response object
//  * @param {NextFunction} next - Express next function
//  * @returns {Promise<void>} - Asynchronous function that calls next() if authorized
//  * 
//  * @throws {StatusCodes.UNAUTHORIZED} - If no user is authenticated
//  * @throws {StatusCodes.FORBIDDEN} - If user is not registered as a streamer
//  * 
//  * @example
//  * // Usage in a route definition:
//  * router.post('/stream', authenticate, isStreamer, streamController.startStream);
//  */
// export const isStreamer = async (req: Request, res: Response, next: NextFunction) => {
//     const user = req.user;
//     if (!user) {
//         console.error("User not found");
//         res.sendStatus(StatusCodes.UNAUTHORIZED);
//         return;
//     }

//     const isStreamer = await prisma.streamers.findUnique({
//         where: {
//             userId: user.userId
//         }
//     });

//     if (!isStreamer) {
//         console.error("User is not a streamer");
//         res.sendStatus(StatusCodes.FORBIDDEN);
//         return;
//     }

//     next();
// }


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

    // Jeśli nie ma żadnych tokenów, przejdź dalej (authenticate zajmie się resztą)
    if (!accessToken || !refreshToken) {
        return next();
    }

    try {
        // Próba weryfikacji access tokena
        jwt.verify(accessToken, JWT_ACCESS_SECRET);
        return next(); // Token jest poprawny, kontynuuj
    } catch (error) {
        // Jeśli token wygasł (i tylko wtedy), spróbuj odświeżyć
        if (error instanceof jwt.TokenExpiredError) {
            console.error("Access token expired, trying to refresh...");
            try {
                // Najpierw zweryfikuj refresh token
                const decodedRefreshToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
                    userId: number;
                    tokenVersion: number;
                };

                // Sprawdź czy token istnieje w bazie danych i nie jest unieważniony
                const tokenRecord = await prisma.refreshToken.findFirst({
                    where: {
                        token: refreshToken,
                        invalidated: false,
                        userId: decodedRefreshToken.userId
                    }
                });

                if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
                    return next(); // Token nieprawidłowy lub wygasły
                }

                // Pobierz dane użytkownika
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
                    return next();
                }

                // Generuj nowy access token
                const newAccessToken = jwt.sign(user, JWT_ACCESS_SECRET, { expiresIn: "15m" });

                // Ustaw nowy access token
                res.cookie('JWT', newAccessToken, {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    maxAge: 15 * 60 * 1000 // 15 minut
                });

                // Zmodyfikuj obiekt żądania, aby zawierał dane użytkownika
                req.user = user;
                req.newAccessToken = newAccessToken;

                return next();
            } catch (err) {
                console.error("Error refreshing token automatically:", err);
                return next();
            }
        } else {
            // Inny błąd weryfikacji tokena
            return next();
        }
    }
};