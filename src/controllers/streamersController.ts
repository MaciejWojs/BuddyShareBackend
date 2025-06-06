import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { sql } from 'bun';
import axios from 'axios';
import { transformStreamsData } from '../utils/streams';
import { SocketState } from '../socket/state';
import { generateToken } from '../utils/generateToken';

const prisma = new PrismaClient();

/**
 * Controller function to retrieve all streamers from the database
 * 
 * This function fetches all streamer records along with their associated user information
 * and returns them as a JSON response.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with streamers data
 * 
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamers', getAllStreamers);
 */
export const getAllStreamers = async (req: Request, res: Response) => {
    try {

        const streamers = await prisma.streamers.findMany({
            select: {
                streamerId: true,
                userId: true,
                // Celowo pomijamy pole token
                user: {
                    select: {
                        userInfo: true,
                    },
                },
            },
        });

        res.status(StatusCodes.OK).json(streamers);
    } catch (error) {
        console.error('Error fetching streamers:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

/**
 * Controller function to retrieve streamer information by username
 * 
 * This function returns user information for a specified streamer.
 * It relies on middleware to verify the user exists and is a streamer.
 * 
 * @param {Request} req - Express request object with userInfo and streamer properties attached by middleware
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with streamer data
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamer/:username', userExistsMiddleware, isStreamer, getStreamerByUsername);
 */
export const getStreamerByUsername = async (req: Request, res: Response) => {
    // At this point, userExistsMiddleware has verified the user exists
    // and attached the user info to req.userInfo
    // isStreamer middleware has verified the user is a streamer
    // and attached the streamer info to req.streamer

    // Sprawdzamy, czy użytkownik przeglądający stronę jest tym samym streamerem
    const isOwner = req.user && req.streamer && req.user.userInfo.userInfoId === req.streamer.userId;

    // Modyfikujemy zapytanie SQL, aby uwzględnić prywatne streamy, gdy właściciel przegląda
    const live = await sql`
                    SELECT *
                    FROM streams s
                        JOIN stream_options so ON s.id = so.id
                    WHERE
                        s.streamer_id = ${req.streamer.streamerId}
                        AND so."isLive" = TRUE
                        ${isOwner ? sql`` : sql`AND so."isPublic" = TRUE`}
                        AND so."isDeleted" = FALSE
                    ORDER BY
                        so.created_at DESC
                    LIMIT 1;
                    `;

    // console.log("LIVE: ", live);
    // console.log("Is owner viewing: ", isOwner);

    const { token, ...streamerWithoutToken } = req.streamer;

    // Przygotowanie odpowiedzi
    const response: {
        userInfo: typeof req.userInfo,
        streamer: typeof streamerWithoutToken,
        stream: { urls: any, isOwnerViewing: boolean } | null
    } = {
        userInfo: req.userInfo,
        streamer: streamerWithoutToken,
        stream: null
    };

    // Dodaj stream jako osobny klucz, a nie jako część streamera
    if (live.length > 0) {
        // Tworzenie podstawowego obiektu stream z dodatkową flagą isOwnerViewing
        response.stream = {
            ...live[0],
            urls: null,
            isOwnerViewing: isOwner
        };

        const host = process.env.STREAM_HOST || "http://nginx:8080/api";
        const endpoint = `${host}/streams`;

        const urls = await axios.get(endpoint);
        if (urls && urls.data) {
            // Przekształć dane streamu
            const transformedStreams = transformStreamsData(urls.data);

            // Filtruj tylko streamy zawierające token streamera w nazwie
            if (transformedStreams && transformedStreams.streams && Array.isArray(transformedStreams.streams)) {
                const streamerToken = req.streamer.token;
                const streamerStreams = transformedStreams.streams.filter((stream: { name: string | any[]; }) =>
                    stream.name && stream.name.includes(streamerToken)
                );

                // console.log("Found streams for token: ", streamerToken, streamerStreams.length);

                // Dodaj urls jako właściwość obiektu stream
                response.stream!.urls = streamerStreams.length > 0 ? streamerStreams : null;
            } else {
                response.stream!.urls = null;
            }
        }
    }

    res.status(StatusCodes.OK).json(response);
}

/**
 * Controller function to retrieve all moderators for a specific streamer
 * 
 * This function fetches all moderator records associated with the specified streamer
 * and returns them as a JSON response. It includes the user information for each moderator.
 * The streamer's existence is already verified by previous middleware (userExistsMiddleware, isStreamer).
 * 
 * @param {Request} req - Express request object containing streamer information from middleware
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with moderators data
 * 
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamers/:username/moderators', userExistsMiddleware, isStreamer, getStreamerModerators);
 */
export const getStreamerModerators = async (req: Request, res: Response) => {
    // The middleware (userExistsMiddleware and isStreamer) has already validated
    // that the streamer exists and attached it to req.streamer
    const streamer = req.streamer;

    try {
        const moderators = await prisma.streamModerators.findMany({
            where: {
                streamerId: streamer.streamerId,
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

/**
 * Controller function to retrieve information about a specific moderator for a streamer
 * 
 * This function fetches information about a specific moderator assigned to the 
 * specified streamer by their username.
 * 
 * @param {Request} req - Express request object containing streamer and moderator information
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with moderator data
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If streamer or moderator username is not provided
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database query fails
 * 
 * @example
 * // Usage in a route definition:
 * router.get('/streamers/:username/moderators/:modusername', userExists, isStreamer, getStreamerModeratorByUsername);
 */
export const getStreamerModeratorByUsername = async (req: Request, res: Response) => {
    // The middleware (userExistsMiddleware, isStreamer, isModerator, isStreamerModerator) 
    // has already validated that the streamer exists and attached it to req.streamer
    // and validated the moderator username
    console.log("Atempting to get streamer moderator by username");
    // If we reach this point, moderator relationship exists and is in req.streamerModerator
    if (req.isStreamerModerator && req.streamerModerator) {
        res.status(StatusCodes.OK).json(req.streamerModerator);
        return
    }

    // If the moderator exists but is not assigned to this streamer
    if (req.isModerator && !req.isStreamerModerator) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: `Moderator is not assigned to this streamer`
        });
        return
    }

    // This is a fallback in case middleware chain is incomplete
    res.status(StatusCodes.NOT_FOUND).json({
        message: ReasonPhrases.NOT_FOUND
    });
    return
}

/**
 * Controller function to add a moderator to a streamer's moderator team
 * 
 * This function adds a specified user as a moderator for a streamer.
 * If the user is not already a moderator, it creates a new moderator record.
 * Then it creates a relationship between the streamer and the moderator.
 * 
 * @param {Request} req - Express request object containing streamer and moderator information
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with updated moderators list
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If required middleware hasn't been executed or parameters are missing
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database operations fail
 * 
 * @example
 * // Usage in a route definition:
 * router.post('/streamers/:username/moderators/:modusername', userExists, isStreamer, isModerator, isStreamerModerator, addStreamerModerator);
 */
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
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }
    if (isModerator === undefined) {
        console.error("isModerator not executed, navigating to", req.originalUrl);
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }

    if (streamerREQ === undefined) {
        console.error("isStreamer not executed, navigating to", req.originalUrl);
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }

    if (!streamerUsername || !moderatorUsername) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }

    if (streamerModerator && isStreamerModerator) {
        console.log("streamerModerator: ", streamerModerator);
        console.log("isStreamerModerator: ", isStreamerModerator);
        console.log(`${moderatorUsername} is already a ${streamerUsername} moderator`);
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }
    const tempUser = await prisma.usersInfo.findUnique({
        where: {
            username: moderatorUsername,
        }
    })

    if (!tempUser) {
        console.log("There is no user called", moderatorUsername);
        res.status(StatusCodes.NOT_FOUND).json({ message: ReasonPhrases.NOT_FOUND });
        return
    }

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

/**
 * Controller function to delete a moderator from a streamer's moderator team
 * 
 * This function removes the specified moderator from the streamer's moderator team
 * by deleting the relationship record in the streamModerators table.
 * 
 * @param {Request} req - Express request object containing streamer and moderator information
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Asynchronous function that sends JSON response with updated moderators list
 * 
 * @throws {StatusCodes.BAD_REQUEST} - If required middleware hasn't been executed or parameters are missing
 * @throws {StatusCodes.NOT_FOUND} - If the moderator record cannot be found
 * @throws {StatusCodes.INTERNAL_SERVER_ERROR} - If database operations fail
 * 
 * @example
 * // Usage in a route definition:
 * router.delete('/streamers/:username/moderators/:modusername', userExists, isStreamer, isModerator, isStreamerModerator, deleteStreamerModerator);
 */
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
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }
    if (isModerator === undefined) {
        console.error("isModerator not executed, navigating to", req.originalUrl);
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }

    if (streamerREQ === undefined) {
        console.error("isStreamer not executed, navigating to", req.originalUrl);
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }
    if (!streamerUsername || !moderatorUsername) {
        console.log("streamer: ", streamerUsername);
        console.log("moderator: ", moderatorUsername);
        console.log("streamer or moderator username not found");
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }
    if (!isModerator && !moderator) {
        console.log(`${moderatorUsername} is not a moderator`);
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }
    if (!streamerModerator && !isStreamerModerator) {
        console.log(`${moderatorUsername} is not a ${streamerUsername} moderator`);
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
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

            console.log("MODERATOR-RECORD: ", moderatorRecord);

            if (!moderatorRecord) {
                res.status(StatusCodes.NOT_FOUND).json({ message: "Moderator record not found" });
                return
            }

            await prisma.streamModerators.delete({
                where: {
                    streamModeratorId: moderatorRecord.streamModeratorId,
                },
            });

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
            console.error('Error deleting moderator:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
        }
    }
}

/**
 * Fetches the token for a streamer.
 * 
 * This controller function retrieves the token associated with the authenticated 
 * streamer from the request object and returns it in the response.
 *
 * @param {Request} req - The Express request object containing user and streamer information.
 * @param {Response} res - The Express response object used to send the token back to the client.
 * @returns {void}
 *
 * @remarks
 * Expects the streamer token to be available in `req.streamer.token` and user information in `req.userInfo`.
 * Returns a JSON object with the token and a 200 OK status code.
 */
export const getStreamerToken = async (req: Request, res: Response) => {
    console.log("Getting streamer token for", req.userInfo.username);
    res.status(StatusCodes.OK).json({
        token: req.streamer.token,
    });

    return;
}

export const updateStreamerToken = async (req: Request, res: Response) => {
    console.log("Updating streamer token for", req.userInfo.username);
    const streamer = req.streamer;
    const updatedToken = generateToken();

    try {
        const updatedStreamer = await prisma.streamers.update({
            where: {
                streamerId: streamer.streamerId,
            },
            data: {
                token: updatedToken,
            },
        });

        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            token: updatedToken,
        });
    } catch (error) {
        console.error('Error updating streamer token:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
    return;
}

export const getStreamerSubscribers = async (req: Request, res: Response) => {
    console.log("Getting streamer subscribers for", req.userInfo.username);
    const streamer = req.streamer;

    try {
        const subscribers = await prisma.subscribers.findMany({
            where: {
                streamerId: streamer.streamerId,
            },
            include: {
                user: {
                    select: {
                        userInfo: true,
                    },
                },
            }
        });

        res.status(StatusCodes.OK).json(subscribers);

    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}
export const updateStreamerSubscription = async (req: Request, res: Response) => {
    console.log("Updating streamer subscription for", req.userInfo.username);
    const streamer = req.streamer;
    const userID = req.user?.userId;

    if (!userID) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }
    try {
        // Tworzenie nowej subskrypcji
        await prisma.subscribers.create({
            data: {
                userId: userID,
                streamerId: streamer.streamerId
            }
        });

        //TODO jezeli jest live to dodaj do socketState
        SocketState.addSubscriber(streamer.streamerId, userID.toString());

        // Pobieranie wszystkich subskrypcji dla tego streamera
        //! FUTURE PROCEDURE
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
            WHERE s.user_id = ${userID}`;

        console.log("SUBSCRIPTIONS: ", subscriptions);
        res.status(StatusCodes.OK).json(subscriptions);
    }
    catch (error) {
        console.error('Error updating streamer subscription:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
    return;
}
export const deleteStreamerSubscription = async (req: Request, res: Response) => {
    console.log("Deleting streamer subscription for", req.userInfo.username);
    const streamer = req.streamer;
    const userID = req.user?.userId;

    if (!userID) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: ReasonPhrases.BAD_REQUEST });
        return
    }
    try {
        // Usuwanie subskrypcji bezpośrednio z tabeli subscribers
        await prisma.subscribers.deleteMany({
            where: {
                userId: userID,
                streamerId: streamer.streamerId
            }
        });

        //TODO jezeli jest live to usun z socketStat
        SocketState.removeSubscriber(streamer.streamerId, userID.toString());

        // Pobieranie pozostałych subskrypcji dla tego streamera
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
            WHERE s.user_id = ${userID}`;

        console.log("SUBSCRIPTIONS: ", subscriptions);
        res.status(StatusCodes.OK).json(subscriptions);

    }
    catch (error) {
        console.error('Error deleting streamer subscription:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
    return;
}

/**
 * Returns the top X most active chat users from all finished and public streams of a given streamer.
 *
 * @async
 * @function getTopChatUsersForStreamer
 * @param {Request} req - Express request object containing streamer info
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Sends a JSON response with the top chat users
 *
 * @example
 * // Usage in a route definition:
 * router.get('/streamers/:username/top-chat-users', getTopChatUsersForStreamer);
 */
export const getTopChatUsersForStreamer = async (req: Request, res: Response) => {    console.log("Getting streamers stats for", req.userInfo.username);
    const streamerId = req.streamer?.streamerId;

    const limit = 10;

    const top_chat_users_for_streamer = await sql`
        SELECT * from get_top_chat_users_for_streamer(${streamerId}, ${limit})
    `;



    res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        stats: {
            topChatUsers: top_chat_users_for_streamer,
        }
    })
}

export const getRaportForStreamer = async (req: Request, res: Response) => {
    console.log("Getting raport for streamer", req.userInfo.username);
    const streamerId = req.streamer?.streamerId;

    const raport = await sql`
        SELECT * from get_streaming_report_for_streamer(${streamerId})
    `;
    if (raport.length === 0) {
        res.status(StatusCodes.NOT_FOUND).json({
            message: "No raport found for this streamer"
        });
        return;
    }
    res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        raport: raport
    });
}