import { sql } from 'bun';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware that checks if a notification exists for the authenticated user.
 *
 * @async
 * @function notifactionExist
 * @param {Request} req - Express request object containing notification ID in params and userInfo
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>} - Calls next() if notification exists, otherwise sends 404 response
 *
 * @example
 * // Usage in a route:
 * router.delete('/notifications/:id', notifactionExist, deleteUserNotification);
 */
export const notifactionExist = async (req: Request, res: Response, next: Function) => {
    const notificationId = req.params.id;

    const { count } = await sql` select * from notifications where id = ${notificationId} and "user_id" = ${req.userInfo.user.userId} `;
    console.log("does notifiaction exist Count: (should be 1) ", count);
    if (count === 0) {
        res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Notification not found'
        });
        return;
    }
    next();
}