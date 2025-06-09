import { StatusCodes } from "http-status-codes";


export const tokenCache = new Map<string, string>();

/**
 * Middleware that checks if a stream token is cached and returns it if available.
 * If not cached, passes control to the next middleware.
 *
 * @param {Request} req - Express request object containing streamId in query or params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Returns the token if found in cache, otherwise calls next()
 *
 * @example
 * // Usage in a route definition:
 * router.get('/streams/:streamId/resolve-token', resolveStreamerTokenCache, resolveStreamerToken);
 */
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