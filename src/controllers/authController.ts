import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as EmailValidator from 'email-validator';
import jwt from 'jsonwebtoken';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { getPasswordHash } from '../utils/hash';

const prisma = new PrismaClient();
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';

/**
 * Authenticates a user and creates a JWT token.
 * 
 * This function handles user login by verifying credentials (username/email and password hash).
 * If authentication is successful, it generates a JWT token and sets it as an HTTP-only cookie.
 * 
 * @param req - Express request object containing login data
 * @param res - Express response object used to send the appropriate response
 * 
 * @returns {void} - Doesn't return a value, but sends a JSON response with an appropriate status code:
 * - 200 OK with success=true if authentication was successful
 * - 400 Bad Request if required fields are missing
 * - 401 Unauthorized if credentials are invalid
 * - 500 Internal Server Error if the database operation reports an error
 */
export const login = (req: Request, res: Response): void => {
    console.log("Logging in user...");
    const { username, reqHASH } = req.body;
    if (!username || !reqHASH) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ReasonPhrases.BAD_REQUEST });
        return;
    }

    const email = EmailValidator.validate(username) ? username : null;
    const loginField = email ? { email } : { displayName: username };

    prisma.user.findFirst({
        where: {
            ...loginField,
            passwordHash: reqHASH
        }
    }).then((prismaUser) => {
        if (prismaUser) {
            const { passwordHash, ...user } = prismaUser;
            const token = jwt.sign(user, JWT_ACCESS_SECRET, { expiresIn: "1h" });
            res.cookie('JWT', token, { signed: true, httpOnly: true, secure: true })
                .json({ success: true, message: ReasonPhrases.OK });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: ReasonPhrases.UNAUTHORIZED });
        }
    }).catch((error) => {
        console.error("Failed to login user:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
};

/**
 * Registers a new user in the system.
 * 
 * This function handles the registration process for new users. It validates the required fields
 * (username, email, and password), checks if the email format is valid, generates a password hash,
 * and checks if the username or email already exist in the database. If all validations pass,
 * it creates a new user record in the database.
 * 
 * @param req - The Express request object containing user registration data in the body
 * @param res - The Express response object used to send back the appropriate response
 * 
 * @returns {Promise<void>} - Returns nothing, but sends a JSON response with appropriate status code:
 * - 200 OK with success=true if user is created successfully
 * - 400 Bad Request if required fields are missing or email is invalid
 * - 409 Conflict if username or email already exists (with 'cause' field indicating which one)
 * - 500 Internal Server Error if hash generation fails or database operation throws an error
 */
export const register = async (req: Request, res: Response) => {
    console.log("Registering user...");
    const { username, email, password }: { username: string, email: string, password: string } = req.body;
    // console.log("Username: " + username);
    // console.log("Email: " + email);
    // console.log("Password " + password);

    if (!username || !email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ReasonPhrases.BAD_REQUEST });
        return;
    }

    const isCorrectEmail = EmailValidator.validate(email);
    if (!isCorrectEmail) {
        console.log("Invalid email");
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ReasonPhrases.BAD_REQUEST });
        return;
    }
    console.log("Generating hash for password...");
    const HASH = getPasswordHash(password);
    // console.log(HASH);

    if (!HASH) {
        console.log("Failed to generate hash");
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ReasonPhrases.INTERNAL_SERVER_ERROR });
        return;
    }
    console.log("Hash generated successfully");

    console.log("Creating user in database...");
    try {
        const exist_displayName = await prisma.user.findFirst({
            where: {
                displayName: username
            }
        });
        const exist_email = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (exist_displayName) {
            console.log(`User with this username ${username} already exists`);
            res.status(StatusCodes.CONFLICT).json({ success: false, cause: "username" });
            return;
        }

        if (exist_email) {
            console.log(`User with this email ${email} already exists`);
            res.status(StatusCodes.CONFLICT).json({ success: false, cause: "email" });
            return;
        }

        const usr = await prisma.user.create({
            data: {
                displayName: username,
                email: email,
                passwordHash: HASH,
                lastLogin: new Date()
            }
        });
        console.log("User created successfully:", username);
        console.log("User role", usr.role);
        res.json({ success: true, message: ReasonPhrases.OK });
    } catch (error) {
        console.error("Failed to create user:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
};

/**
 * Retrieves information about the currently logged-in user.
 * 
 * This function returns user data stored in the request object,
 * which is inserted by the authentication middleware.
 * 
 * @param req - Express request object containing user data
 * @param res - Express response object used to return user data
 * 
 * @returns {Promise<void>} - Doesn't return a value, but sends a JSON response with user data
 */
export const getMe = async (req: Request, res: Response) => {
    res.json(req.user).status(StatusCodes.OK);
};

/**
 * Logs out the current user by clearing the authentication cookie.
 * 
 * @param req - Express request object
 * @param res - Express response object used to clear the cookie
 * 
 * @returns {void} - Doesn't return a value, but clears the JWT cookie and sends a success response
 */
export const logout = (req: Request, res: Response) => {
    res.clearCookie('JWT').json({ success: true, message: ReasonPhrases.OK });
    res.end();
};

/**
 * Test endpoint to verify the authentication middleware operation.
 * 
 * This function returns authenticated user data for testing purposes.
 * 
 * @param req - Express request object containing user data from middleware
 * @param res - Express response object used to send the response
 * 
 * @returns {void} - Doesn't return a value, but sends a JSON response with user data for testing
 */
export const test = (req: Request, res: Response) => {
    res.json({ success: true, message: ReasonPhrases.OK, user: req.user });
};