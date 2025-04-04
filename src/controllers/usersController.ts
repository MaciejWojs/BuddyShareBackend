import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

// Rozszerzenie interfejsu Request o pole userInfo
declare global {
    namespace Express {
        interface Request {
            userInfo?: any;
        }
    }
}

const prisma = new PrismaClient();

/**
 * Checks if a user exists by username.
 * @param req Express request object containing username in the params
 * @param res Express response object
 */
export const exists = async (req: Request, res: Response) => {
    // userExistsMiddleware zapewnia, że req.userInfo istnieje
    console.log(`User ${req.userInfo.username} exists`);
    res.status(StatusCodes.OK).json(req.userInfo);
};

/**
 * Retrieves all users from the database, excluding their password hashes.
 * @param req Express request object
 * @param res Express response object
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const prismaUsers = await prisma.users.findMany();

        if (!prismaUsers) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: true,
                message: `${ReasonPhrases.NOT_FOUND}`
            });
            return;
        }

        res.status(StatusCodes.OK).json(prismaUsers);
    } catch (error: any) {
        console.error(`Error fetching users: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching users'
        });
    }
}

/**
 * Retrieves information about all users in the database.
 * 
 * @async
 * @function getAllUsersInfo
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 * 
 * @todo Add authentication middleware to protect this route
 * @todo Ensure only admin users can access this endpoint
 * 
 * @example
 * // Route definition
 * router.get('/users', getAllUsersInfo);
 * 
 * @throws Will throw an error if the database connection fails
 */
export const getAllUsersInfo = async (req: Request, res: Response) => {
    //! TODO: Add authentication middleware to protect this route
    //! MUST BE AN ADMIN
    try {
        const prismaUsers = await prisma.usersInfo.findMany();

        if (!prismaUsers) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: true,
                message: `${ReasonPhrases.NOT_FOUND}`
            });
            return;
        }

        res.status(StatusCodes.OK).json(prismaUsers);
    } catch (error: any) {
        console.error(`Error fetching users: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching users'
        });
    }
}

/**
 * Bans a user by updating their isBanned status to true in the database.
 * 
 * @param {Request} req - Express request object containing user information in req.userInfo
 * @param {Response} res - Express response object used to send response to client
 * @returns {Promise<void>} A promise that resolves when the ban operation completes
 * @throws Will send a 400 status if the user is already banned
 * @throws Will send a 500 status if there's an error during the database operation
 */
export const banUser = async (req: Request, res: Response) => {
    // Użytkownik istnieje w req.userInfo dzięki middleware
    try {
        if (req.userInfo.isBanned) {
            console.error(`User ${req.userInfo.username} is already banned`);
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'User is already banned'
            });
            return;
        }

        await prisma.usersInfo.update({
            where: {
                username: req.userInfo.username
            },
            data: {
                isBanned: true
            }
        });

        console.log(`User ${req.userInfo.username} banned successfully`);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'User banned successfully'
        });
    } catch (error: any) {
        console.error(`Error banning user: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error banning user'
        });
    }
}

/**
 * Unbans a user who is currently banned
 * 
 * @param req - The Express request object containing user information
 * @param res - The Express response object
 * @returns {Promise<void>} - A promise that resolves when the unban operation is complete
 * 
 * @throws Will return 400 BAD REQUEST if the user is not already banned
 * @throws Will return 500 INTERNAL SERVER ERROR if there's an error during the unban process
 */
export const unbanUser = async (req: Request, res: Response) => {
    try {
        if (!req.userInfo.isBanned) {
            console.error(`User ${req.userInfo.username} is not banned`);
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'User is not banned'
            });
            return;
        }

        await prisma.usersInfo.update({
            where: {
                username: req.userInfo.username
            },
            data: {
                isBanned: false
            }
        });

        console.log(`User ${req.userInfo.username} unbanned successfully`);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'User unbanned successfully'
        });
    } catch (error: any) {
        console.error(`Error unbanning user: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error unbanning user'
        });
    }
}

/**
 * Change the role of a user
 * @async
 * @param {Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.role - The new role to assign to the user
 * @param {Object} req.userInfo - User information from authentication middleware
 * @param {string} req.userInfo.username - Username of the authenticated user
 * @param {string} req.userInfo.userRole - Current role of the authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - A promise that resolves when the operation completes
 * @throws {Error} - If there's an issue updating the user role in the database
 *
 * @description
 * This controller function changes a user's role. It validates that:
 * - A role is provided in the request body
 * - The new role is different from the user's current role
 * - The new role is valid according to the Role enum
 * 
 * After validation, it updates the user's role in the database and returns
 * an appropriate response. If any errors occur during the process, it returns
 * an error response with the corresponding status code.
 */
export const changeUsersRole = async (req: Request, res: Response) => {
    const { role } = req.body;

    if (!role) {
        console.error('No role provided');
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No role provided'
        });
        return;
    }

    try {
        if (req.userInfo.userRole === role) {
            console.error(`User ${req.userInfo.username} already has the role ${role}`);
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: `User already has the role ${role}`
            });
            return;
        }

        if (!Object.values(Role).includes(role as Role)) {
            console.error(`Invalid role ${role}`);
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: `Invalid role ${role}`
            });
            return;
        }

        await prisma.usersInfo.update({
            where: {
                username: req.userInfo.username
            },
            data: {
                userRole: role as Role
            }
        });

        console.log(`User ${req.userInfo.username} role changed to ${role} successfully`);
        res.status(StatusCodes.OK).json({
            success: true,
            message: `User role changed to ${role} successfully`
        });
    } catch (error: any) {
        console.error(`Error changing user role: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error changing user role'
        });
    }
}

/**
 * Controller function to get user role.
 * 
 * @async
 * @function getUserRole
 * @param {Request} req - Express request object containing user information
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise representing the completion of the request handling
 * @description Returns the user role from the request's userInfo property
 */
export const getUserRole = async (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        success: true,
        role: req.userInfo.userRole
    });
}

/**
 * Changes the description of the authenticated user.
 * 
 * This controller function updates the user's description in the database.
 * It requires a valid description in the request body and an authenticated user.
 * 
 * @param {Request} req - Express request object containing the user description in body
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} A Promise that resolves when the operation completes
 * 
 * @throws {Error} If there is a database error during the update
 * 
 * @example
 * // Request body format:
 * // { "description": "New user description" }
 * 
 * // Success response (200 OK):
 * // { "success": true, "message": "User description changed to [description] successfully" }
 * 
 * // Error responses:
 * // 400 Bad Request - { "success": false, "message": "No description provided" }
 * // 500 Internal Server Error - { "success": false, "message": "Error changing user description" }
 */
export const changeUserDescription = async (req: Request, res: Response) => {
    const { description } = req.body;

    if (!description) {
        console.error('No description provided');
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No description provided'
        });
        return;
    }

    try {
        await prisma.usersInfo.update({
            where: {
                username: req.userInfo.username
            },
            data: {
                description: description
            }
        });

        console.log(`User ${req.userInfo.username} description changed to ${description} successfully`);
        res.status(StatusCodes.OK).json({
            success: true,
            message: `User description changed to ${description} successfully`
        });
    } catch (error: any) {
        console.error(`Error changing user description: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error changing user description'
        });
    }
}

/**
 * Changes the username of the authenticated user.
 * 
 * @param req - Express request object containing user information and the new username in the request body
 * @param res - Express response object used to send back the API response
 * 
 * @remarks
 * The function expects a 'newUsername' field in the request body.
 * The user must be authenticated and their current username is obtained from req.userInfo.
 * 
 * @returns Promise<void> - This function doesn't return a value but sends a response to the client:
 *   - 200 OK if the username was changed successfully
 *   - 400 BAD_REQUEST if no newUsername was provided
 *   - 500 INTERNAL_SERVER_ERROR if there was an error during the update process
 * 
 * @example
 * // Request body:
 * // {
 * //   "newUsername": "newUserName"
 * // }
 */
export const changeUserUsername = async (req: Request, res: Response) => {
    const { newUsername } = req.body;

    if (!newUsername) {
        console.error('No new username provided');
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No new username provided'
        });
        return;
    }

    try {
        await prisma.usersInfo.update({
            where: {
                username: req.userInfo.username
            },
            data: {
                username: newUsername
            }
        });

        console.log(`User ${req.userInfo.username} changed to ${newUsername} successfully`);
        res.status(StatusCodes.OK).json({
            success: true,
            message: `User changed to ${newUsername} successfully`
        });
    } catch (error: any) {
        console.error(`Error changing user username: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error changing user username'
        });
    }
}

/**
 * Retrieves the user profile information from the request object.
 * 
 * This controller function extracts the user profile information excluding
 * sensitive or internal fields (userRole, userInfoId, isBanned) from the 
 * request's userInfo object and sends it back as a JSON response.
 * 
 * @param {Request} req - Express request object containing user information
 * @param {Response} res - Express response object used to send back the user profile
 * @returns {Promise<void>} A promise that resolves when the user profile is sent
 * @throws {Error} May throw an error if the request processing fails
 */
export const getUserProfile = async (req: Request, res: Response) => {
    const { userRole, userInfoId, isBanned, ...profile } = req.userInfo;
    res.status(StatusCodes.OK).json({
        ...profile
    });
}

/**
 * Fetches user settings for the authenticated user.
 * 
 * @async
 * @function getUserSettings
 * @param {Request} req - Express request object containing the authenticated user information in req.userInfo
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Sends a JSON response with user settings or error message
 * 
 * @throws Will throw an error if database operations fail
 * 
 * @example
 * // Route implementation
 * router.get('/settings', authenticate, getUserSettings);
 */
export const getUserSettings = async (req: Request, res: Response) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                userSettingsId: req.userInfo.userInfoId
            }
        });
        const userSettings = await prisma.userSettings.findUnique({
            where: {
                userSettingsId: user?.userSettingsId
            }
        });
        if (!userSettings) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User settings not found'
            });
            return;
        }
        const { passwordHash, ...userSettingsWithoutPassword } = userSettings;
        res.status(StatusCodes.OK).json({
            ...userSettingsWithoutPassword
        });
    } catch (error: any) {
        console.error(`Error fetching user settings: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching user settings'
        });
    }
}



// const deleteUser = async (userId: number) => {
//     try {
//         await prisma.user.delete({
//             where: {
//                 id: userId
//             }
//         });
//         console.log(`User with ID ${userId} deleted successfully`);
//     } catch (error) {
//         console.error(`Error deleting user with ID ${userId}: ${error}`);
//     }
// }