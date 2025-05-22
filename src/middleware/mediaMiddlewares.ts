import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient, Role } from '@prisma/client';
import { Socket } from 'socket.io';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        const directory: string = require('crypto').randomBytes(8).toString('hex');
        const fullPath = path.join('media', directory);
        fs.mkdirSync(fullPath, { recursive: true });
        cb(null, fullPath);
    },
    filename: function (_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'source' + ext);
    }
})

const imageMimeTypes: { [key: string]: string[] } = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
};

const upload = multer({
    storage: storage,
    fileFilter: function (_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = imageMimeTypes[file.mimetype];

        if (allowedExts && allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Rozszerzenie pliku nie zgadza się z typem MIME lub plik nie jest obrazem!'));
        }
    }
});

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, function (err) {
        if (err) {
            res.sendStatus(StatusCodes.BAD_REQUEST);
            console.error(err.message);
            return
        }
        next();
    });
};

export const createOtherTypesOfMedia = async (req: Request, res: Response) => {
    const { dir } = req.query;
    
}

export const generateSocialMediaImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file || !req.file.path) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Brak pliku do przetworzenia' });
            return 
        }

        const inputPath = req.file.path;
        const dir = path.dirname(inputPath);
        const ext = path.extname(inputPath).toLowerCase();

        await Promise.all([
            // Miniaturka (np. 320x180)
            sharp(inputPath)
                .resize(320, 180)
                .toFile(path.join(dir, `thumbnail${ext}`)),

            // Avatar (np. 128x128, crop)
            sharp(inputPath)
                .resize(128, 128)
                .toFile(path.join(dir, `avatar${ext}`)),

            // Okładka (np. 640x360)
            sharp(inputPath)
                .resize(640, 360)
                .toFile(path.join(dir, `cover${ext}`)),
        ]);

        next();
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Błąd podczas generowania obrazów' });
    }
};