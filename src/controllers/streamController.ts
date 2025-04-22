import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import axios from 'axios';
import { sql } from 'bun';
import { transformStreamsData } from '../utils/streams';

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
      DEFAULT,
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


    const subscribers = await sql`select * from subscribers s join users u on u.id = s.user_id join users_info ui on u.id = ui.id where s.streamer_id = ${streamerId} and ui."isBanned" = false`;

    for (const subscriber of subscribers) {
        const notification = await sql` insert into notifications (id, user_id, stream_id, message, created_at, "isRead")
        values (default, ${subscriber.user_id}, ${stream[0].id}, ${req.streamer.user.userInfo.username + ' started streaming!'}, default, default)
        returning *`;
        console.log(notification[0]);
        // console.log(subscriber);
    }

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

