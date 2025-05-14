import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { sql } from 'bun';
import { broadcastNewStream, broadcastStream as broadcastPatchStream, broadcastStreamEnd, notifyStreamer } from '../socket';
import { console } from 'node:inspector';
import { resolveStreamerTokenCache, tokenCache } from '../middleware/cache';
import { getStreamerByUsername } from './streamersController';

interface StreamData {
    access_token: any;
    stream_urls?: any;
    [key: string]: any;
}

interface StreamRequest extends Request {
    streamId?: string;
    streamer?: any;
    userInfo?: any;
}

const helperCombineStreams = async (streamerId: number | null = null) => {
    const host = process.env.STREAM_HOST_VIDEO || "http://localhost";
    try {
        const streams = await sql`
        SELECT  s.*, str.access_token, so.description as stream_description, so.*, c.name as category_name, ui.*, 
        array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
        FROM streams s
        JOIN stream_options so ON s.options_id = so.id
        JOIN streamers str ON s.streamer_id = str.id
        JOIN users_info ui ON str.user_id = ui.id
        LEFT JOIN streams_categories sc ON s.id = sc.stream_id
        LEFT JOIN categories c ON sc.category_id = c.id
        LEFT JOIN streams_tags stg ON s.id = stg.stream_id
        LEFT JOIN tags t ON stg.tag_id = t.id
        WHERE so."isLive" = TRUE
        AND so."isDeleted" = FALSE
        ${streamerId ? sql`AND str.id = ${streamerId}` : sql``}
        GROUP BY s.id, so.id, c.name, ui.id, str.access_token
        ORDER BY so.created_at DESC
        `;

        if (streams.length === 0) {
            console.log('No streams found');
            return [];
        }

        for (const stream of streams) {
            stream.stream_urls = [
                {
                    name: "source",
                    dash: `${host}/dash/${stream.options_id}.mpd`
                },
                {
                    name: "720p",
                    dash: `${host}/dash/test/${stream.options_id}_720p.mpd`
                },
                {
                    name: "480p",
                    dash: `${host}/dash/test/${stream.options_id}_480p.mpd`
                },
                {
                    name: "360p",
                    dash: `${host}/dash/test/${stream.options_id}_360p.mpd`
                }
            ];
        }

        const securedStreams = streams
            .map((stream: { access_token: any; }) => {
                // Tworzymy nowy obiekt bez tokena dostępu
                const streamWithoutToken: StreamData = {
                    ...stream
                };

                delete streamWithoutToken.access_token;
                delete streamWithoutToken.email;

                return streamWithoutToken;
            })
        return securedStreams;
    }
    catch (error) {
        console.error('Error fetching streams:', error);
    }
    return [];
}

export const getAllStreams = async (_req: Request, res: Response) => {
    try {
        const combinedStreams = await helperCombineStreams();
        res.status(StatusCodes.OK).json(combinedStreams);
    } catch (error) {
        console.error('Error fetching streams:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
};

// * Verifies streamer token in OBS
export const notifyStreamStart = async (req: Request, res: Response) => {
    console.log('notifyStreamStart endpoint hit');

    const streamerId = req.streamer.streamerId;
    const streamerUserId = req.streamer.user.userId;
    const username = req.streamer.user.userInfo.username;

    // 1. Sprawdź, czy streamer już nadaje
    const [{ count }] = await sql`
    SELECT COUNT(*) AS count
      FROM streams s
      JOIN stream_options o ON s.options_id = o.id
     WHERE s.streamer_id = ${streamerId}
       AND o."isLive" = TRUE
  `;
    if (count > 0) {
        console.log(`${username} is already live`);
        res.status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Streamer is already live' });
        return;
    }

    try {
        const [stream] = await sql.begin(async (sql) => {
            // 2.1. INSERT do stream_options (uproszczony)
            const [opts] = await sql`
              INSERT INTO stream_options (
                  title,
                  description,
                  "isLive"
              ) VALUES (
                  'Sample title',
                  'Sample description',
                  TRUE
              ) RETURNING id, title, description
          `;

            // 2.2. INSERT do streams
            const [stream] = await sql`
              INSERT INTO streams (streamer_id, options_id)
              VALUES (${streamerId}, ${opts.id})
              RETURNING id
          `;
            res.sendStatus(StatusCodes.OK);


            // 2.3. Naprawiony INSERT do notifications
            //     const subscribers = await sql`
            //     SELECT s.user_id
            //     FROM subscribers s
            //     JOIN users_info ui ON ui.id = s.user_id
            //     WHERE s.streamer_id = ${streamerId}
            //       AND ui."isBanned" = FALSE
            //   `;

            // if (subscribers.length === 0) {
            //     console.log('No subscribers found for this streamer');
            //     return [opts, stream, []]; // Zwróć pustą tablicę powiadomień
            // }

            // // 2. Przygotuj dane do hurtowego INSERT-a
            // const notificationsData = subscribers.map((sub: { user_id: any; }) => ({
            //     user_id: sub.user_id,
            //     stream_id: stream.id,
            //     message: `${username || 'Streamer'} started streaming!`,
            // }));

            // 3. Hurtowy insert używając sql([...])
            //     const notifications = await sql`
            //     INSERT INTO notifications ${sql(notificationsData)}
            //     RETURNING *
            //   `;

            return [
                // opts,
                stream
                // notifications
            ];
        });
        // console.log('Inserted stream_options:', opts);
        // console.log('Inserted stream:', stream);
        // console.log(`Created ${notifications.length} notifications`);

        // 3. Wyślij powiadomienia przez Socket.IO
        // await broadcastNewStream(
        //     {
        //         streamId: stream.id,
        //         streamerId,
        //         streamerName: username,
        //         title: opts.title,
        //         description: opts.description,
        //         category: 'default',
        //     },
        //     notifications
        // );

        notifyStreamer(stream.id, streamerUserId, username);

        console.log(`${username} started streaming ▶️`);
        return
    } catch (error) {
        console.error('Transaction error:', error);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal server error' });
        return
    }
}

export const notifyStreamEnd = async (req: Request, res: Response) => {
    console.log('notifyStreamEnd endpoint hit');
    const streamerId = req.streamer.streamerId;
    console.log(`Streamer ID: ${streamerId}`);

    const count = await getStreamerStreamsCount(streamerId);

    if (count < 1) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Streamer is not live' });
        console.log(`${req.streamer.user.userInfo.username} is not live`);
        return;
    }

    const streamOptions = await sql`
    UPDATE stream_options so
    SET "isLive" = false,
        updated_at = DEFAULT
    FROM streams s
    WHERE so.id = s.options_id
      AND s.streamer_id = ${streamerId}
      AND so."isLive" = true
    RETURNING so.*`;

    broadcastStreamEnd(
        {
            streamId: streamOptions[0].id,
            streamerId: streamerId,
            streamerName: req.streamer.user.userInfo.username,
        },
    )

    tokenCache.delete(streamOptions[0].id.toString());

    console.log(`${req.streamer.user.userInfo.username} finished streaming. ⏹️`);
    res.sendStatus(StatusCodes.OK);
    return;
}

const getStreamerStreamsCount = async (streamerId: number) => {
    const query = await sql`SELECT COUNT(*) cnt
    FROM streams s 
    JOIN stream_options so ON s.id = so.id 
    WHERE s.streamer_id = ${streamerId} AND so."isLive" = TRUE;
    `;
    return query[0].cnt;
}

export const getStream = async (req: Request, res: Response) => {
    console.log('getStream endpoint hit for user:', req.userInfo.username);
    const streamerId = req.streamer.streamerId;
    console.log(`Streamer ID: ${streamerId}`);
    const streamOptionId = req.params.id;
    console.log(`Stream ID: ${streamOptionId}`);

    if (!streamOptionId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Stream ID is required' });
        return;
    }
    const stream = await sql`
    SELECT s.*, so.*
    FROM streams s
    JOIN stream_options so ON s.options_id = so.id
    WHERE s.streamer_id = ${streamerId} AND s.id = ${streamOptionId}
    LIMIT 1
    `;
    if (stream.length === 0) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Stream not found' });
        return;
    }
    res.status(StatusCodes.OK).json(stream[0]);
    return;


}

export const patchStream = async (req: Request, res: Response) => {
    const streamerUsername = req.userInfo.username;
    console.log('patchStream endpoint hit for user:', streamerUsername);
    const streamerId = req.streamer.streamerId;
    console.log(`Streamer ID: ${streamerId}`);

    const streamOptionId = req.params.id;
    console.log(`Stream option ID: ${streamOptionId}`);

    if (!streamOptionId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Stream ID is required' });
        return;
    }

    const streamTitle = req.body.title;
    const streamDescription = req.body.description;
    const streamIsPublic = req.body.isPublic;


    const stream = await sql`
    UPDATE stream_options
    SET title = ${streamTitle},
        description = ${streamDescription},
        "isPublic" = ${streamIsPublic},
        updated_at = DEFAULT,
        thumbnail = ${req.body.thumbnail || null} 
    WHERE id = ${streamOptionId}
    RETURNING *;
`
    const combinedStreams = await helperCombineStreams(streamerId);

    broadcastPatchStream(combinedStreams[0]);
    if (stream.length === 0) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Stream not found' });
        return;
    }

    if (streamIsPublic) {

        try {
            const [notifications] = await sql.begin(async (sql) => {

                // 2.3. Naprawiony INSERT do notifications
                const subscribers = await sql`
            SELECT s.user_id
            FROM subscribers s
            JOIN users_info ui ON ui.id = s.user_id
            WHERE s.streamer_id = ${streamerId}
              AND ui."isBanned" = FALSE
          `;

                if (subscribers.length === 0) {
                    console.log('No subscribers found for this streamer');
                    return [[]]; // Zwróć pustą tablicę powiadomień
                }

                // 2. Przygotuj dane do hurtowego INSERT-a
                const notificationsData = subscribers.map((sub: { user_id: any; }) => ({
                    user_id: sub.user_id,
                    stream_id: streamOptionId,
                    // stream_id: stream.id,
                    message: `${streamerUsername || 'Streamer'} started streaming!`,
                }));

                // 3. Hurtowy insert używając sql([...])
                const notifications = await sql`
            INSERT INTO notifications ${sql(notificationsData)}
            RETURNING *
          `;

                return [notifications];
            });
            // console.log('Inserted stream_options:', opts);
            // console.log('Inserted stream:', stream);
            // console.log(`Created ${notifications.length} notifications`);

            // 3. Wyślij powiadomienia przez Socket.IO
            await broadcastNewStream(
                {
                    streamId: streamOptionId,
                    streamerId,
                    streamerName: streamerUsername,
                    title: streamTitle,
                    description: streamDescription,
                    category: 'default',
                },
                notifications
            );


        } catch (error) {
            console.error('Transaction error:', error);
            res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: 'Internal server error' });
            return
        }

    }

    res.status(StatusCodes.OK).json(stream[0]);
    return;

}

export const softDeleteStream = async (req: Request, res: Response) => {
    console.log('softDeleteStream endpoint hit for user:', req.userInfo.username);
    const streamerId = req.streamer.streamerId;
    console.log(`Streamer ID: ${streamerId}`);

    const streamOptionId = req.params.id;
    console.log(`Stream option ID: ${streamOptionId}`);

    if (!streamOptionId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Stream ID is required' });
        return;
    }

    const stream = await sql`
    UPDATE stream_options
    SET "isDeleted" = true
    WHERE id = ${streamOptionId}
    RETURNING *;
`
    if (stream.length === 0) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Stream not found' });
        return;
    }
    res.status(StatusCodes.OK).json(stream[0]);
    return;

}


export const resolveStreamerToken = async (req: StreamRequest, res: Response) => {
    console.log('resolveStreamerToken endpoint hit');

    // Get stream_id from the request query parameters
    const streamId = req.streamId;

    try {
        // Fetch the token from database based on stream ID
        const token = await sql`
            SELECT s.access_token
            FROM streamers s
            JOIN streams st ON s.id = st.streamer_id
            WHERE st.id = ${streamId}
            LIMIT 1
        `;


        if (token.length === 0) {
            console.error('Stream not found or no token available');
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }

        tokenCache.set(streamId!, token[0].access_token);

        // Set token header and return success
        res.setHeader('Token', token[0].access_token);
        res.sendStatus(StatusCodes.OK);
        console.log(`Sent OK to nginx with token: ${token[0].access_token}`);
        return;
    } catch (error) {
        console.error('Error fetching streamer token:', error);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        return;
    }
}
