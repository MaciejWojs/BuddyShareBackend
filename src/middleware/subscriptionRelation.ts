import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();


export const subscriptionRelationExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const streamerID = req.streamer?.streamerId;
        const userID = req.user?.userId;


        if (!userID) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username is required' });
            return;
        }
        if (!streamerID) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Streamer is required' });
            return;
        }
        // Check if the subscription relation exists

  const subscriptionRelation = await prisma.subscribers.findFirst({
    where: {
        streamerId: streamerID,
        userId: userID
    }
});

        if (!subscriptionRelation) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Subscription relation not found'
            });
            return;
        }

        // If the relation exists, attach it to the request object

        // req.subscriptionRelation = subscriptionRelation;

        next();

    }
    catch (error) {
        console.error(`Error checking if subscribtion relation exists: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    }

}

export const subscriptionRelationNotExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const streamerID = req.streamer?.streamerId;
        const userID = req.user?.userId;
        if (!userID) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username is required' });
            return;
        }
        if (!streamerID) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Streamer is required' });
            return;
        }
        // Check if the subscription relation exists
        const subscriptionRelation = await prisma.subscribers.findFirst({
            where: {
                streamerId: streamerID,
                userId: userID
            }
        });
        if (subscriptionRelation) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Subscription relation already exists'
            });
            return;
        }
        // If the relation does not exist, attach it to the request object
        // req.subscriptionRelation = subscriptionRelation;
        next();
    }
    catch (error) {
        console.error(`Error checking if subscribtion relation exists: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    }
}