import { Request, Response, NextFunction } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

// Extend the Request type
declare global {
    namespace Express {
        interface Request {
            isModerator?: boolean;
            moderator?: any;
            isStreamerModerator?: boolean;
            streamer?: any;
        }
    }
}

const prisma = new PrismaClient();


export const isModerator = async (req: Request, res: Response, next: NextFunction) => {

    const moderatorUsername = req.params.modusername || req.body.modusername;

    if (!moderatorUsername) {
        console.log("moderator username not found");
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }


    try {
        const moderator = await prisma.moderators.findFirst({
            where: {
                user: {
                    userInfo: {
                        username: moderatorUsername,
                    }
                }
            }
        });



        req.isModerator = moderator ? true : false;
        if (req.isModerator) req.moderator = moderator;
        next();
    }
    catch (error) {
        console.error(`Error checking if user exists: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error checking if user exists'
        });
    }

}

export const isStreamerModerator = async (req: Request, res: Response, next: NextFunction) => {
    const streamerREQ = req.streamer || req.body.streamer;


    const moderatorUsername = req.params.modusername || req.body.modusername;



    if (!streamerREQ || !moderatorUsername) {
        console.log("streamer or moderator username not found");
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    const isModerator = req.isModerator;
    if (isModerator) {
        // console.log("REQUEST MODERATOR: ", req.moderator);
        // console.log("REQUEST STREAMER: ", streamerREQ);
        try {
            const streamerModerator = await prisma.streamModerators.findFirst({
                where: {
                    moderatorId: req.moderator.moderatorId,
                    streamerId: streamerREQ.streamerId
                }
            });

            req.isStreamerModerator = streamerModerator ? true : false;

            if (req.isStreamerModerator) req.streamerModerator = streamerModerator;
            next();
        }
        catch (error) {
            console.error(`Error checking if user exists: ${error}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Error checking if user exists'
            });
        }
    }
    else {
        req.isStreamerModerator = false;
    }

    next();
}