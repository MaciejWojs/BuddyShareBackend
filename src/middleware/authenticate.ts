import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

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
        res.json({ success: false, message: "JWT_ACCESS" });
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
        console.log("User authenticated:", user.displayName);
        req.user = user;
        next();
    });
};