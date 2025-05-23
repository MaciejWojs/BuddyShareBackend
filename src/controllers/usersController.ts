import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { Glob, sql } from 'bun';
import { SocketState } from '../socket/state';
import { FileRequest } from '../middleware/mediaMiddlewares';
import * as path from 'path';

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
    //! MUST BE AN ADMIN
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
        // Set headers for streaming JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Start the response with an opening bracket for JSON array
        res.write('[');

        const prismaUsers = await prisma.usersInfo.findMany();

        if (!prismaUsers || prismaUsers.length === 0) {
            // Close the array and end the response if no users found
            res.write(']');
            res.end();
            return;
        }

        // Stream each user one by one
        prismaUsers.forEach((user, index) => {
            // Add comma separator between objects except for the last one
            const separator = index < prismaUsers.length - 1 ? ',' : '';
            res.write(JSON.stringify(user) + separator);
        });

        // Close the JSON array and end the response
        res.write(']');
        res.end();
    } catch (error: any) {
        console.error(`Error fetching users: ${error}`);

        // If headers haven't been sent yet, send error response
        if (!res.headersSent) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error fetching users'
            });
        } else {
            // If we've already started streaming, end with error notation
            res.write('{"error": "Error occurred during streaming"}]');
            res.end();
        }
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
    //! MUST BE AN ADMIN
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
    //! MUST BE AN ADMIN
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
    //! MUST BE AN ADMIN
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
    //! MUST BE AN ADMIN
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

export const patchUserProfile = async (req: Request, res: Response) => {
    console.log("Updating user profile for user ID:", req.userInfo.user.userId);

    const { description } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;
    const fileHashes = (req as FileRequest).fileHashes;

    if (!description && (!files || files.length === 0)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No data provided to update'
        });
        return;
    }

    // Przypisz profilePicture i profileBanner na podstawie kolejności plików i hashy
    let updateData: any = {};
    if (files && fileHashes && files.length === fileHashes.length) {
        files.forEach((file, idx) => {
            // Rozpoznaj po nazwie oryginalnej pliku
            if (file.originalname.toLowerCase().includes('banner')) {
                updateData.profileBanner = fileHashes[idx];
            } else if (file.originalname.toLowerCase().includes('avatar') || file.originalname.toLowerCase().includes('profile')) {
                updateData.profilePicture = fileHashes[idx];
            }
        });
    }

    // Nadpisz, jeśli podano jawnie w body
    if (description) updateData.description = description;

    try {
        const updatedUser = await prisma.usersInfo.update({
            where: {
                userInfoId: req.userInfo.user.userId
            },
            data: updateData
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'User profile updated successfully',
            user: updatedUser
        });
    } catch (error: any) {
        console.error(`Error updating user profile: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error updating user profile'
        });
    }
}

export const getUserFollowers = async (req: Request, res: Response) => {
    console.log("REQ.USERINFO: ", req.userInfo.user.userId);

    try {
        const followers = await prisma.followers.findMany({
            where: {
                followedUserId: req.userInfo.user.userId
            },
            include: {
                follower: {  // Changed from 'followed' to 'follower'
                    select: {
                        userInfo: {
                            select: {
                                username: true,
                                // description: true,
                                profilePicture: true,
                            }
                        }
                    }
                }
            }
        });
        res.status(StatusCodes.OK).json(followers);
    }
    catch (error: any) {
        console.error(`Error fetching user followers: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}


export const getUserFollowing = async (req: Request, res: Response) => {

    console.log("REQ.USERINFO: ", req.userInfo.user.userId);
    try {
        const following = await prisma.followers.findMany({
            where: {
                followerUserId: req.userInfo.user.userId
            },
            include: {
                followed: {
                    select: {
                        userInfo: {
                            select: {
                                username: true,
                                // description: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            }
        });
        res.status(StatusCodes.OK).json(following);
    }
    catch (error: any) {
        console.error(`Error fetching user following: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

export const getUserFollowersCount = async (req: Request, res: Response) => {
    console.log("Getting followers count for user ID:", req.userInfo.user.userId);
    try {
        const followersCount = await prisma.followers.count({
            where: {
                followedUserId: req.userInfo.user.userId
            }
        });
        res.status(StatusCodes.OK).json({
            success: true,
            count: followersCount
        });
    }
    catch (error: any) {
        console.error(`Error fetching user followers count: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

export const getUserFollowingCount = async (req: Request, res: Response) => {
    console.log("Getting following count for user ID:", req.userInfo.user.userId);
    try {
        const followingCount = await prisma.followers.count({
            where: {
                followerUserId: req.userInfo.user.userId
            }
        });
        res.status(StatusCodes.OK).json({
            success: true,
            count: followingCount
        });
    }
    catch (error: any) {
        console.error(`Error fetching user following count: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

export const followUser = async (req: Request, res: Response) => {
    console.log("Attempting to follow user with ID:", req.userInfo.user.userId);
    try {
        const followerUserId = req.userInfoOld.user.userId;
        const followedUserId = req.userInfo.user.userId;
        console.log("Attempting to follow user with ID:", followedUserId);

        if (!followedUserId || !followerUserId) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: `${ReasonPhrases.BAD_REQUEST}`
            });
            return;
        }

        if (followerUserId === followedUserId) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'You cannot follow yourself'
            });
            return;
        }


        await prisma.followers.create({
            data: {
                followerUserId: followerUserId,
                followedUserId: followedUserId
            }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: `User with id: ${followerUserId} followed user with id: ${followedUserId} successfully`
        });
        console.log(`User with id: ${followerUserId} followed user with id: ${followedUserId} successfully`)


        if (!req.streamer) return;

        if (!(req.streamer.userId === followedUserId)) {
            console.log("User is not a streamer, skipping SocketState update");
            return;
        }

        console.log("User is a streamer, updating SocketState", req.streamer);

        const streamerId = req.streamer.streamerId.toString();
        if (SocketState.streamers.has(streamerId)) {
            console.log("Adding follower to SocketState");
            SocketState.addFollower(streamerId, followerUserId.toString());
        }
    }
    catch (error: any) {
        console.error(`Error following user: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }

}

export const unfollowUser = async (req: Request, res: Response) => {
    console.log("Attempting to unfollow user :", req.userInfo.user.userId);
    try {
        const followerUserId = req.userInfoOld?.user?.userId;
        const followedUserId = req.userInfo?.user?.userId;

        // Validate both IDs exist
        if (!followerUserId || !followedUserId) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Missing user IDs required for unfollowing'
            });
            return;
        }

        // Check if users are the same
        if (followerUserId === followedUserId) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'You cannot unfollow yourself'
            });
            return;
        }

        // Check if the follow relationship exists
        const existingFollow = await prisma.followers.findUnique({
            where: {
                followerUserId_followedUserId: {
                    followerUserId: followerUserId,
                    followedUserId: followedUserId
                }
            }
        });

        if (!existingFollow) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'You are not following this user'
            });
            return;
        }

        await prisma.followers.delete({
            where: {
                followerUserId_followedUserId: {
                    followerUserId: followerUserId,
                    followedUserId: followedUserId
                }
            }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: `User with id: ${followerUserId} unfollowed user with id: ${followedUserId} successfully`
        });
        console.log(`User with id: ${followerUserId} unfollowed user with id: ${followedUserId} successfully`);


        if (!req.streamer) return;

        if (!(req.streamer.userId === followedUserId)) {
            console.log("User is not a streamer, skipping SocketState update");
            return;
        }
        const streamerId = req.streamer.streamerId.toString();
        if (req.streamer && SocketState.streamers.has(streamerId)) {
            console.log("Removing follower from SocketState");
            SocketState.removeFollower(streamerId, followerUserId.toString());
        }
    }
    catch (error: any) {
        console.error(`Error unfollowing user: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }

}

export const getUserNotifications = async (req: Request, res: Response) => {
    console.log("Getting notifications for user ID:", req.userInfo.user.userId);
    try {
        const notifications = await sql`
            SELECT * FROM notifications
            WHERE "user_id" = ${req.userInfo.user.userId}
        `;

        // console.log("Notifications: ", notifications);
        res.status(StatusCodes.OK).json(notifications);
    }
    catch (error: any) {
        console.error(`Error fetching user notifications: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

export const updateUserNotification = async (req: Request, res: Response) => {
    console.log("Updating notification for user ID:", req.userInfo.user.userId);
    try {
        const notificationId = req.params.id;
        const { isRead } = req.body;

        // const { count } = await sql` select * from notifications where id = ${notificationId} and "user_id" = ${req.userInfo.user.userId} `;
        // console.log("does notifiaction exist Count: (should be 1) ", count);
        // if (count === 0) {
        //     res.status(StatusCodes.NOT_FOUND).json({
        //         success: false,
        //         message: 'Notification not found'
        //     });
        //     return;
        // }

        if (isRead === true || isRead === false || isRead === 1 || isRead === 0) {
            console.log("Updating notification with ID:", notificationId);
            await sql`
                UPDATE notifications
                SET "isRead" = ${isRead}
                WHERE id = ${notificationId}
            `;
            res.status(StatusCodes.OK).json({
                success: true,
                message: `Notification with ID: ${notificationId} updated successfully`
            });
        }
    } catch (error: any) {
        console.error(`Error updating user notification: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

export const deleteUserNotification = async (req: Request, res: Response) => {
    console.log("deleting notification for user ID:", req.userInfo.user.userId);
    try {
        const notificationId = req.params.id;

        // const { count } = await sql` select * from notifications where id = ${notificationId} and "user_id" = ${req.userInfo.user.userId} `;
        // console.log("does notifiaction exist Count: (should be 1) ", count);
        // if (count === 0) {
        //     res.status(StatusCodes.NOT_FOUND).json({
        //         success: false,
        //         message: 'Notification not found'
        //     });
        //     return;
        // }

        console.log("deleting notification with ID:", notificationId);
        await sql`
                DELETE FROM notifications WHERE id = ${notificationId} 
            `;
        res.status(StatusCodes.OK).json({
            success: true,
            message: `Notification with ID: ${notificationId} deleted successfully`
        });
    } catch (error: any) {
        console.error(`Error deleting user notification: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

/**
 * Aktualizuje wiele powiadomień użytkownika jednocześnie
 * 
 * @param req - Express request object z tablicą powiadomień do aktualizacji
 * @param res - Express response object
 * 
 * @example
 * // Format danych wejściowych:
 * // {
 * //   notifications: [
 * //     { id: 1, isRead: true },
 * //     { id: 2, isRead: true },
 * //     ...
 * //   ]
 * // }
 */
export const updateUserNotificationsInBulk = async (req: Request, res: Response) => {
    console.log("Updating notifications in bulk for user ID:", req.userInfo.user.userId);
    try {
        const { notifications } = req.body;

        if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Invalid data format. Expected an array of notifications.'
            });
            return
        }

        // Pobierz wszystkie identyfikatory powiadomień
        const notificationIds = notifications.map(n => n.id);
        console.log(`Updating ${notificationIds.length} notifications`);

        // Sprawdź, czy wszystkie powiadomienia należą do użytkownika
        const userNotifications = await sql`
            SELECT id FROM notifications 
            WHERE "user_id" = ${req.userInfo.user.userId} 
            AND id IN ${sql(notificationIds)}
        `;

        const foundIds = userNotifications.map((n: any) => n.id);

        // Filtruj tylko powiadomienia, które należą do użytkownika
        const validNotifications = notifications.filter(n => foundIds.includes(n.id));

        if (validNotifications.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No matching notifications found for this user'
            });
            return
        }

        // Jeśli są jakieś niepasujące powiadomienia, zaloguj ostrzeżenie
        if (validNotifications.length < notifications.length) {
            console.warn(`Niektóre powiadomienia (${notifications.length - validNotifications.length}) nie należą do użytkownika lub nie istnieją`);
        }

        // Wykonaj aktualizacje
        for (const notification of validNotifications) {
            if (notification.isRead === true || notification.isRead === false) {
                await sql`
                    UPDATE notifications
                    SET "isRead" = ${notification.isRead}
                    WHERE id = ${notification.id} AND "user_id" = ${req.userInfo.user.userId}
                `;
            }
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: `Successfully updated ${validNotifications.length} notifications`,
            updatedIds: validNotifications.map(n => n.id)
        });
    } catch (error: any) {
        console.error(`Error updating user notifications in bulk: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

/**
 * Deletes multiple user notifications simultaneously
 * 
 * @param req - Express request object with an array of notification IDs to delete in the request body
 * @param res - Express response object
 * 
 * @example
 * // Input data format:
 * // {
 * //   notifications: [1, 2, 3, ...] // array of notification IDs to delete
 * // }
 */
export const deleteUserNotificationsInBulk = async (req: Request, res: Response) => {
    console.log("Deleting notifications in bulk for user ID:", req.userInfo.user.userId);
    try {
        const { notifications } = req.body;

        if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Nieprawidłowy format danych. Oczekiwano tablicy identyfikatorów powiadomień.'
            });
            return
        }

        // Sprawdź, czy wszystkie powiadomienia należą do użytkownika
        const userNotifications = await sql`
            SELECT id FROM notifications 
            WHERE "user_id" = ${req.userInfo.user.userId} 
            AND id IN ${sql(notifications)}
        `;

        const foundIds = userNotifications.map((n: any) => n.id);

        if (foundIds.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Nie znaleziono pasujących powiadomień dla tego użytkownika'
            });
            return
        }

        // Jeśli są jakieś niepasujące powiadomienia, zaloguj ostrzeżenie
        if (foundIds.length < notifications.length) {
            console.warn(`Niektóre powiadomienia (${notifications.length - foundIds.length}) nie należą do użytkownika lub nie istnieją`);
        }

        // Usuń wszystkie znalezione powiadomienia należące do użytkownika
        await sql`
            DELETE FROM notifications
            WHERE "user_id" = ${req.userInfo.user.userId}
            AND id IN ${sql(foundIds)}
        `;

        res.status(StatusCodes.OK).json({
            success: true,
            message: `Pomyślnie usunięto ${foundIds.length} powiadomień`,
            deletedIds: foundIds
        });
    } catch (error: any) {
        console.error(`Error deleting user notifications in bulk: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

export const getUserSubscriptions = async (req: Request, res: Response) => {
    console.log("Getting subscriptions for user ID:", req.userInfo.user.userId);
    try {
        const subscriptions = await sql`
            SELECT 
                s.id AS "subscriberId", 
                s.user_id AS "userId", 
                s.streamer_id AS "streamerId", 
                ui.username AS "streamerUsername", 
                ui.profile_picture AS "profilePicture"
            FROM subscribers s
            JOIN streamers str ON s.streamer_id = str.id
            JOIN users u ON str.user_id = u.id
            JOIN users_info ui ON u.user_info_id = ui.id
            WHERE s.user_id = ${req.userInfo.user.userId}
        `;
        subscriptions.subscriberName = req.userInfo.username;

        res.status(StatusCodes.OK).json(subscriptions);
    }
    catch (error: any) {
        console.error(`Error fetching user subscriptions: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `${ReasonPhrases.INTERNAL_SERVER_ERROR}`
        });
    }
}

export const getUserAvatar = async (req: Request, res: Response) => {
    console.log("Getting avatar for user ID:", req.userInfo.user.userId);

    try {
        const result = await sql`
            SELECT profile_picture FROM users_info 
            WHERE id = ${req.userInfo.user.userId}
        `;

        if (!result || result.length === 0 || !result[0].profile_picture) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Avatar not found'
            });
            return;
        }

        const glob = new Glob("media/" + result[0].profile_picture + "/avatar.*");
        let avatarFile = null;
        for await (const file of glob.scan()) {
            avatarFile = Bun.file(file);
            console.log("Avatar file search: ", file);
        }

        if (!avatarFile) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Avatar file not found'
            });
            return;
        }

        const ext = path.extname(avatarFile.name!).toLowerCase();
        let mime = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        if (ext === '.png') mime = 'image/png';
        if (ext === '.webp') mime = 'image/webp';

        res.setHeader('Content-Type', mime);
        const arrayBuffer = await avatarFile.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('Error retrieving avatar:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error retrieving avatar'
        });
    }

}