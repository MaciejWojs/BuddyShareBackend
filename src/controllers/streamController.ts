import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import axios from 'axios';
import { sql } from 'bun';
import { transformStreamsData } from '../utils/streams';
import { broadcastNewStream, broadcastStream as broadcastStream, broadcastStreamEnd } from '../socket';
import { console } from 'node:inspector';

const prisma = new PrismaClient();
const host = process.env.STREAM_HOST || "http://nginx:8080/api";

interface StreamData {
    access_token: any;
    stream_urls?: any;
    [key: string]: any;
}

interface StreamWithUrls extends StreamData {
    stream_urls: any;
}

const helperCombineStreams = async (streamerId: number | null = null) => {
    const endpoint = `${host}/streams`;
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
        AND so."isPublic" = TRUE
        ${streamerId ? sql`AND str.id = ${streamerId}` : sql``}
        GROUP BY s.id, so.id, c.name, ui.id, str.access_token
        ORDER BY so.created_at DESC
        `;

        if (streams.length === 0) {
            console.log('No streams found');
            return [];
        }

        // Pobierz dane streamów z zewnętrznego API
        const response = await axios.get(endpoint);
        const simplifiedStreams = transformStreamsData(response.data);

        // Łączenie danych z bazy danych z danymi z API
        const combinedStreams = streams
            .map((stream: { access_token: any; }) => {
                // Szukamy pasujących streamów z API po tokenie dostępu
                const apiStreamData = simplifiedStreams.streams?.find(
                    (apiStream: { name: any; }) => apiStream.name === stream.access_token
                );

                // Jeśli nie znaleziono pasującego streamu w API lub nie zawiera właściwości qualities,
                // pomijamy ten stream
                if (!apiStreamData || !apiStreamData.qualities) {
                    return [];
                }

                // Tworzymy nowy obiekt bez tokena dostępu
                const streamWithoutToken: StreamWithUrls = {
                    ...stream,
                    stream_urls: undefined
                };

                // Usuwamy token dostępu
                delete streamWithoutToken.access_token;
                delete streamWithoutToken.email;

                // Dodajemy linki do streamów
                streamWithoutToken.stream_urls = apiStreamData.qualities;

                return streamWithoutToken;
            })
            .filter((stream: null) => stream !== null); // Filtrujemy, aby usunąć streamy bez linków
            console.log("Combined streams: ", combinedStreams.length);
            return combinedStreams;
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


export const notifyStreamStart = async (req: Request, res: Response) => {
    console.log('notifyStreamStart endpoint hit');

    const streamerId = req.streamer.streamerId;
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
        const [opts, stream, notifications] = await sql.begin(async (sql) => {
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
            const subscribers = await sql`
            SELECT s.user_id
            FROM subscribers s
            JOIN users_info ui ON ui.id = s.user_id
            WHERE s.streamer_id = ${streamerId}
              AND ui."isBanned" = FALSE
          `;

            if (subscribers.length === 0) {
                console.log('No subscribers found for this streamer');
                return [opts, stream, []]; // Zwróć pustą tablicę powiadomień
            }

            // 2. Przygotuj dane do hurtowego INSERT-a
            const notificationsData = subscribers.map((sub: { user_id: any; }) => ({
                user_id: sub.user_id,
                stream_id: stream.id,
                message: `${username || 'Streamer'} started streaming!`,
            }));

            // 3. Hurtowy insert używając sql([...])
            const notifications = await sql`
            INSERT INTO notifications ${sql(notificationsData)}
            RETURNING *
          `;

            return [opts, stream, notifications];
        });
        // console.log('Inserted stream_options:', opts);
        // console.log('Inserted stream:', stream);
        // console.log(`Created ${notifications.length} notifications`);

        // 3. Wyślij powiadomienia przez Socket.IO
        await broadcastNewStream(
            {
                streamId: stream.id,
                streamerId,
                streamerName: username,
                title: opts.title,
                description: opts.description,
                category: 'default',
            },
            notifications
        );

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
    console.log('patchStream endpoint hit for user:', req.userInfo.username);
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
    SET title = ${req.body.title},
        description = ${req.body.description},
        "isPublic" = ${req.body.isPublic},
        updated_at = DEFAULT,
        thumbnail = ${req.body.thumbnail || null} 
    WHERE id = ${streamOptionId}
    RETURNING *;
`
    const combinedStreams = await helperCombineStreams(streamerId);

    broadcastStream(combinedStreams[0]);
    if (stream.length === 0) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Stream not found' });
        return;
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

