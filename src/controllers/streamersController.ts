import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { userInfo } from 'os';
import { off } from 'process';

const prisma = new PrismaClient();

export const getAllStreamers = async (req: Request, res: Response) => {
    try {
        const streamers = await prisma.streamers.findMany({
            include: {
                user: {
                    select: { userInfo: true, },
                },
            },
        });

        res.status(StatusCodes.OK).json(streamers);
    } catch (error) {
        console.error('Error fetching streamers:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

export const getStreamerByUsername = async (req: Request, res: Response) => {

    const userInfo = req.userInfo;
    const streamerREQ = req.streamer || req.body.streamer;
    if (!userInfo || !streamerREQ) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    res.status(StatusCodes.OK).json(userInfo);
}

export const getStreamerModerators = async (req: Request, res: Response) => {
    const streamerREQ = req.streamer || req.body.streamer;
    if (!streamerREQ) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    try {
        const moderators = await prisma.streamModerators.findMany({
            where: {
                streamerId: streamerREQ.streamerId,
            },
            include: {
                moderator: {
                    select: {
                        user: {
                            select: {
                                userInfo: true,
                            },
                        }
                    }

                },
            }
        });

        res.status(StatusCodes.OK).json(moderators);
    } catch (error) {
        console.error('Error fetching moderators:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

export const getStreamerModeratorByUsername = async (req: Request, res: Response) => {
    const streamerREQ = req.streamer || req.body.streamer;

    const moderatorUsername = req.params.modusername || req.body.modusername;
    if (!streamerREQ || !moderatorUsername) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    try {
        const moderator = await prisma.streamModerators.findFirst({
            where: {
                moderator: {
                    user: {
                        userInfo: {
                            username: moderatorUsername,

                        }
                    }
                },
                streamerId: streamerREQ.streamerId,
            },
            include: {
                moderator: {
                    select: {
                        user: {
                            select: {
                                userInfo: true,
                            },
                        }
                    }

                },
            }
        });

        res.status(StatusCodes.OK).json(moderator);
    } catch (error) {
        console.error('Error fetching moderators:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}


export const addStreamerModerator = async (req: Request, res: Response) => {
    console.log("req.method: ", req.method);
    const streamerREQ = req.streamer || req.body.streamer;
    let streamerModerator = req.streamerModerator;
    let moderator = req.moderator;
    const isModerator = req.isModerator;
    const isStreamerModerator = req.isStreamerModerator;
    const streamerUsername = req.params.username || req.body.username;
    const moderatorUsername = req.params.modusername || req.body.modusername;

    if (isStreamerModerator === undefined) {
        console.error("isStreamerModerator not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (isModerator === undefined) {
        console.error("isModerator not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (streamerREQ === undefined) {
        console.error("isStreamer not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (!streamerUsername || !moderatorUsername) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (streamerModerator && isStreamerModerator) {
        console.log("streamerModerator: ", streamerModerator);
        console.log("isStreamerModerator: ", isStreamerModerator);
        console.log(`${moderatorUsername} is already a ${streamerUsername} moderator`);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    const tempUser = await prisma.usersInfo.findUnique({
        where: {
            username: moderatorUsername,
        }
    })

    if (!isModerator && !moderator) {
        moderator = await prisma.moderators.create({

            data: {
                userId: tempUser!!.userInfoId,

            },
        });
        console.log("Moderator created: ", moderator);
    };

    // res.status(StatusCodes.OK).json(moderator);

    if (!streamerModerator && !isStreamerModerator) {
        streamerModerator = await prisma.streamModerators.create({
            data: {
                streamerId: streamerREQ.streamerId,
                moderatorId: moderator.moderatorId,
            },
        });
        console.log("streamerModerator created: ", streamerModerator);

    };

    try {
        const moderators = await prisma.streamModerators.findMany({
            where: {
                streamerId: streamerREQ.streamerId,
            },
            include: {
                moderator: {
                    select: {
                        user: {
                            select: {
                                userInfo: true,
                            },
                        }
                    }
                },
            }
        });

        console.log("MODERATORS-FINAL: ", moderators);
        res.status(StatusCodes.OK).json(moderators);
    } catch (error) {
        console.error('Error fetching moderators:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

export const deleteStreamerModerator = async (req: Request, res: Response) => {
    console.log("req.method: ", req.method);
    const streamerREQ = req.streamer || req.body.streamer;
    let streamerModerator = req.streamerModerator;
    let moderator = req.moderator;
    const isModerator = req.isModerator;
    const isStreamerModerator = req.isStreamerModerator;
    const streamerUsername = req.params.username || req.body.username;
    const moderatorUsername = req.params.modusername || req.body.modusername;

    if (isStreamerModerator === undefined) {
        console.error("isStreamerModerator not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (isModerator === undefined) {
        console.error("isModerator not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (streamerREQ === undefined) {
        console.error("isStreamer not executed, navigating to", req.originalUrl);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (!streamerUsername || !moderatorUsername) {
        console.log("streamer: ", streamerUsername);
        console.log("moderator: ", moderatorUsername);
        console.log("streamer or moderator username not found");
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (!isModerator && !moderator) {
        console.log(`${moderatorUsername} is not a moderator`);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }
    if (!streamerModerator && !isStreamerModerator) {
        console.log(`${moderatorUsername} is not a ${streamerUsername} moderator`);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
    }

    if (streamerModerator && isStreamerModerator) {
        console.log(`${moderatorUsername} found as ${streamerUsername} moderator, deleting...`);


        try {
            // First find the record to get its unique ID
            const moderatorRecord = await prisma.streamModerators.findFirst({
                where: {
                    streamerId: streamerREQ.streamerId,
                    moderatorId: streamerModerator.moderatorId,
                },
            });

            if (!moderatorRecord) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Moderator record not found" });
            }

            await prisma.streamModerators.delete({
                where: {
                    streamModeratorId: moderatorRecord.streamModeratorId,
                },
            });

            try {
                const moderators = await prisma.streamModerators.findMany({
                    where: {
                        streamerId: streamerREQ.streamerId,
                    },
                    include: {
                        moderator: {
                            select: {
                                user: {
                                    select: {
                                        userInfo: true,
                                    },
                                }
                            }
                        },
                    }
                });

                console.log("MODERATORS-FINAL: ", moderators);
                res.status(StatusCodes.OK).json(moderators);
            } catch (error) {
                console.error('Error fetching moderators:', error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
            }
        } catch (error) {
            console.error('Error deleting moderator:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
        }


    }






}