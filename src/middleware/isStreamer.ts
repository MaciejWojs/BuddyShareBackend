import { Request, Response, NextFunction } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const isStreamer = async (req: Request, res: Response, next: NextFunction) => {
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

            return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        }

        // const user = await prisma.users.findUnique({
        //     where: {
        //         userId : req.userInfo.userId
        //     }
        // });
        console.log("USERINFO: ",req.userInfo);
        const streamer = await prisma.streamers.findUnique({
            where: {
                userId: req.userInfo.user.userId
                
            }
        });
        if (!streamer) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: ReasonPhrases.NOT_FOUND
            });
            return
        }

        req.streamer = streamer;
        next();
    } catch (error) {
        console.error(`Error checking if user exists: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}