import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient, Role } from '@prisma/client';
import { Socket } from 'socket.io';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { isExpression } from 'typescript';

const prisma = new PrismaClient();

export enum ImageTypes {
    SOURCE = 'source',
    AVATAR = 'avatar',
    BANNER = 'banner',
    THUMBNAIL = 'thumbnail',
    COVER = 'cover',
}

export interface FileRequest extends Request {
    fileHashes?: string[];
    files?: Express.Multer.File[]; // Dodaj jeśli chcesz mieć typowanie dla files
    file?: Express.Multer.File;    // Dodaj jeśli chcesz mieć typowanie dla file
}

const storage = multer.diskStorage({
    destination: function (_req: Request, file, cb) {
        // Generuj hash dla każdego pliku osobno
        const directory: string = require('crypto').randomBytes(8).toString('hex');
        // Możesz dodać tablicę hashy do requesta, np. _req.fileHashes
        if (!(_req as FileRequest).fileHashes) (_req as any).fileHashes = [];
        (_req as any).fileHashes.push(directory);
        const fullPath = path.join('media', directory);
        fs.mkdirSync(fullPath, { recursive: true });
        cb(null, fullPath);
    },
    filename: function (_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'source' + ext);
    }
});

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

/**
 * Middleware for handling single image file upload using Multer.
 *
 * @param {FileRequest} req - Express request object with file typing
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 *
 * @example
 * // Usage in a route:
 * router.post('/upload', uploadMiddleware, controller);
 */
export const uploadMiddleware = (req: FileRequest, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, function (err) {
        if (err) {
            res.sendStatus(StatusCodes.BAD_REQUEST);
            console.error(err.message);
            return
        }
        next();
    });
};

/**
 * Middleware for handling optional single image file upload using Multer.
 *
 * @param {FileRequest} req - Express request object with file typing
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 *
 * @example
 * // Usage in a route:
 * router.post('/upload-optional', uploadMiddlewareOptional, controller);
 */
export const uploadMiddlewareOptional = (req: FileRequest, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, function (err) {
        if (err) {
            console.error(err.message);
            return
        }
        next();
    });
};

/**
 * Middleware for handling multiple image file uploads (max 2 files) using Multer.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 *
 * @example
 * // Usage in a route:
 * router.post('/upload-multiple', uploadMiddlewareMultiple, controller);
 */
export const uploadMiddlewareMultiple = (req: Request, res: Response, next: NextFunction) => {
    upload.array('files', 2)(req, res, function (err) {
        if (err) {
            console.error(`uploadMiddlewareMultiple: ${err.message}`);
            return
        }
        next();
    });
}

/**
 * Processes an image file or array of image files, generating multiple variants (thumbnail, avatar, cover, banner).
 *
 * @param {Express.Multer.File | Express.Multer.File[]} file - The file or files to process
 * @returns {Promise<void>} - Resolves when processing is complete
 *
 * @throws Will throw an error if file is invalid, too large, or processing fails
 */
const processImage = async (file: Express.Multer.File | Express.Multer.File[]) => {
    const files = Array.isArray(file) ? file : [file];

    // Definicja rozmiarów i typów obrazów do wygenerowania
    const imageVariants = [
        { type: ImageTypes.THUMBNAIL, width: 320, height: 180 },
        { type: ImageTypes.AVATAR, width: 128, height: 128 },
        { type: ImageTypes.COVER, width: 640, height: 360 },
        { type: ImageTypes.BANNER, width: 1920, height: 480 },
    ];

    await Promise.all(files.map(async (singleFile) => {
        try {
            // Sprawdzenie czy plik istnieje i jest plikiem
            if (!singleFile?.path || !fs.existsSync(singleFile.path) || !fs.statSync(singleFile.path).isFile()) {
                throw new Error('Nieprawidłowa ścieżka pliku lub plik nie istnieje');
            }

            // Ograniczenie rozszerzeń dozwolonych plików
            const ext = path.extname(singleFile.path).toLowerCase();
            const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
            if (!allowedExts.includes(ext)) {
                throw new Error('Niedozwolone rozszerzenie pliku');
            }

            // Ograniczenie rozmiaru pliku (np. max 10MB)
            const stats = fs.statSync(singleFile.path);
            if (stats.size > 10 * 1024 * 1024) {
                throw new Error('Plik jest za duży (max 10MB)');
            }

            const inputPath = singleFile.path;
            const dir = path.dirname(inputPath);

            await Promise.all(
                imageVariants.map(async variant => {
                    const outputPath = path.join(dir, `${variant.type}${ext}`);
                    // Zabezpieczenie przed nadpisaniem pliku źródłowego
                    if (outputPath === inputPath) {
                        throw new Error('Ścieżka wyjściowa nie może być taka sama jak wejściowa');
                    }
                    await sharp(inputPath)
                        .resize(variant.width, variant.height)
                        .toFile(outputPath);
                })
            );
        } catch (err) {
            console.error(`Błąd przetwarzania obrazu: ${err instanceof Error ? err.message : err}`);
            // Możesz rzucić błąd dalej, jeśli chcesz przerwać całą operację
            throw err;
        }
    }));
}

/**
 * Middleware that generates social media image variants for a single uploaded file.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Calls next() on success, sends error on failure
 */
export const generateSocialMediaImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file || !req.file.path) {
            console.error(`GenSocialMediaImages: Brak pliku do przetworzenia podczas ${req.method} ${req.originalUrl} `);
            next();
            return;
        }

        await processImage(req.file);

        next();
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Błąd podczas generowania obrazów' });
    }
};

/**
 * Middleware that generates social media image variants for multiple uploaded files.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>} - Calls next() on success, sends error on failure
 */
export const generateSocialMediaImagesMultiple = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await processImage(req.files as Express.Multer.File[]);
        next();
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Błąd podczas generowania obrazów' });
    }
}