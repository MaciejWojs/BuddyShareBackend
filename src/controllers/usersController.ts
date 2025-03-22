import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as EmailValidator from 'email-validator';
import jwt from 'jsonwebtoken';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { getPasswordHash } from '../utils/hash';

const prisma = new PrismaClient();

/**
 * Checks if a user exists by username.
 * @param req Express request object containing username in the body
 * @param res Express response object
 */
export const exists = async (req: Request, res: Response) => {
    const { username } = req.params;
    if (!username) {
        console.error('No username provided');
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No username provided'
        });
        return;
    }
    prisma.user.findUnique({
        where: {
            displayName: username
        }
    }).then((user) => {
        if (user) {
            console.log(`User ${user.displayName} exists`);
            res.status(StatusCodes.OK).json({
                exists: true,
                success: true,
                message: 'User exists'
            });
        } else {
            console.log(`User ${username} does not exist`);
            res.status(StatusCodes.NOT_FOUND).json({
                exists: false,
                success: true,
                message: 'User not found'
            });
        }
    }
    ).catch((error) => {
        console.error(`Error checking user existence: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error checking user existence'
        });
    }
    );
};
