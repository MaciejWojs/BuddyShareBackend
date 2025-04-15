import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import axios from 'axios';
import { sql } from 'bun';

const prisma = new PrismaClient();
const host = process.env.STREAM_HOST || "http://nginx:8080/api";

export const getAllStreams = async (_req: Request, res: Response) => {
    const endpoint = `${host}/streams`;
    try {
        const response = await axios.get(endpoint);

        // Przekształcenie oryginalnego JSON na uproszczony format
        const simplifiedStreams = transformStreamsData(response.data);

        res.status(StatusCodes.OK).json(simplifiedStreams);
    } catch (error) {
        console.error('Error fetching streams:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
};

/**
 * Transformuje dane z nginx-rtmp na uproszczony format z linkami do streamów
 */
const transformStreamsData = (data: any) => {
    const result: any = { streams: [] };

    // Sprawdzenie, czy mamy dane w oczekiwanym formacie
    if (!data['http-flv'] || !data['http-flv'].servers) {
        return result;
    }

    // Przejdźmy przez wszystkie serwery i aplikacje
    console.log(data['http-flv'].servers[0].applications[1].live['streams']);
    for (const live of data['http-flv'].servers[0].applications[1].live['streams']) {
        const liveName = live.name;
        const streamInfo = {
            name: live.name,
            qualities: [
                {
                    name: "source",
                    dash: `/dash/${liveName}.mpd`
                },
                {
                    name: "720p",
                    dash: `/dash/test/${liveName}_720p.mpd`
                },
                {
                    name: "480p",
                    dash: `/dash/test/${liveName}_480p.mpd`
                },
                {
                    name: "360p",
                    dash: `/dash/test/${liveName}_360p.mpd`
                }
            ],
            active: true,
            // clients: stream.nclients || 0
        };
        result.streams.push(streamInfo);
    }

    return result;
};

export const notifyStreamStart = async (req: Request, res: Response) => {
    console.log('notifyStreamStart endpoint hit');
    const streamerId = req.streamer.streamerId;
    console.log(`Streamer ID: ${streamerId}`);

    const count = await getStreamerStreamsCount(streamerId);

    if (count[0] != 0) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Streamer is already live' });
        console.log(`${req.streamer.user.userInfo.username} is already live`);
        return;
    }

    const streamOptions = await sql`
    INSERT INTO stream_options (
      id,
      title,
      description,
      created_at,
      updated_at,
      thumbnail,
      "isDeleted",
      "isLive",
      "isPublic",
      path
    )
    VALUES (
      DEFAULT,
      'Sample title',
      'Sample description',
      DEFAULT,
      DEFAULT,
      NULL,
      false,
      true,
      true,
      NULL
    )
    RETURNING *`;

    console.log(streamOptions[0]);

    const stream = await sql`
    INSERT INTO streams (
      id, 
      streamer_id,
      options_id) VALUES (default, ${streamerId}, ${streamOptions[0].id})
    RETURNING *`;

    // const stream = await sql
    res.sendStatus(StatusCodes.OK);
    console.log(`${req.streamer.user.userInfo.username} started streaming ▶️`);
    return;
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
