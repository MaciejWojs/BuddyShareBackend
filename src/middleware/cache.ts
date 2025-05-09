import { StatusCodes } from "http-status-codes";


export const tokenCache = new Map<string, string>();

export const resolveStreamerTokenCache = async (req: any, res: any, next: any) => {
    console.log("resolveStreamerTokenCache middleware is being executed");
    const streamId = String(req.query.stream_id || req.params.streamId);
    console.log('StreamID:', streamId);

    if (!streamId) {
        console.error('Stream ID is required');
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
    }

    req.streamId = streamId;

    if (tokenCache.has(streamId)) {
        console.log('Token found in cache for stream ID:', streamId);
        res.setHeader('Token', tokenCache.get(streamId));
        res.sendStatus(StatusCodes.OK);
        return;
    }
    next();
}