import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import axios from 'axios';

const prisma = new PrismaClient();
const host = process.env.NGINX_HOST || "http://localhost:8080/api";

declare global {
    namespace Express {
        interface Request {
            token: string | null;
        }
    }
}


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
    console.log(`${req.streamer.user.userInfo.username} started streaming ▶️`);
    res.sendStatus(StatusCodes.OK);
    return;
}

export const notifyStreamEnd = async (req: Request, res: Response) => {
    console.log('notifyStreamEnd endpoint hit');
    console.log(`${req.streamer.user.userInfo.username} finished streaming. ⏹️`);

    res.sendStatus(StatusCodes.OK);
    return;
}