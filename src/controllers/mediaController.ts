import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as EmailValidator from 'email-validator';
import jwt from 'jsonwebtoken';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { getPasswordHash } from '../utils/hash';
import { ImageTypes } from '../middleware/mediaMiddlewares';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const postImage = async (req: Request, res: Response) => {
    res.sendStatus(StatusCodes.CREATED);
}

export const getImage = async (req: Request, res: Response) => {
    const hash = req.params?.hash || req.query?.hash;
    const type = req.params?.type || req.query?.type;

    if (typeof hash !== 'string' || typeof type !== 'string' || !hash || !type) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Brak parametrów' });
        return;
    }

    const folderPath = path.join('media', hash);
    if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Folder nie istnieje' });
        return;
    }

    // Obsługiwane typy
    const allowedTypes = Object.values(ImageTypes);
    if (!allowedTypes.includes(type as ImageTypes)) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Nieprawidłowy typ obrazu' });
        return;
    }

    // Szukaj pliku o danej nazwie i jednym z dozwolonych rozszerzeń
    const exts = ['.jpg', '.jpeg', '.png', '.webp'];
    let filePath = '';
    let found = false;
    for (const ext of exts) {
        const candidate = path.join(folderPath, `${type}${ext}`);
        if (fs.existsSync(candidate)) {
            filePath = candidate;
            found = true;
            break;
        }
    }
    if (!found) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Plik nie istnieje' });
        return;
    }

    // Ustal MIME na podstawie rozszerzenia
    const ext = path.extname(filePath).toLowerCase();
    let mime = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    if (ext === '.png') mime = 'image/png';
    if (ext === '.webp') mime = 'image/webp';

    res.setHeader('Content-Type', mime);
    const file = Bun.file(filePath);
    const arrayBuffer = await file.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
}