import { sql } from 'bun';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

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