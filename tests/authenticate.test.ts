import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { authenticate } from '../src/middleware/authenticate';
import * as expressTypes from '../src/types/express';
import { StatusCodes } from 'http-status-codes';

/**
 * Mockowanie zmiennych środowiskowych
 * To rozwiązanie pozwala nam symulować środowisko bez modyfikowania
 * rzeczywistych zmiennych środowiskowych systemu
 */
vi.mock('process', () => {
    return {
        env: {
            JWT_ACCESS_SECRET: 'test_secret',
            SALT: 'test_salt',
            PEPPER: 'test_pepper'
        }
    };
});

// Mockowanie PrismaClient
vi.mock('@prisma/client', () => {
    const mockPrismaClient = {
        user: {
            findFirst: vi.fn(),
            create: vi.fn()
        },
        $disconnect: vi.fn()
    };

    return {
        PrismaClient: vi.fn(() => mockPrismaClient)
    };
});

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

/**
 * Testy middleware uwierzytelniania
 */
describe('Authentication Middleware', () => {
    // Przygotowanie mocka dla bazy danych
    const mockPrisma = new PrismaClient();

    beforeEach(() => {
        // Reset wszystkich mocków przed każdym testem
        vi.clearAllMocks();
    });

    it('powinien zwrócić błąd gdy JWT_ACCESS_SECRET nie jest zdefiniowany', async () => {
        // GIVEN: Brak klucza JWT
        vi.stubEnv('JWT_ACCESS_SECRET', '');

        const req = {} as Request;
        const jsonMock = vi.fn();
        const res = { json: jsonMock } as unknown as Response;
        const next = vi.fn();

        // WHEN: Wywołanie middleware
        await authenticate(req, res, next);

        // THEN: Odpowiednia odpowiedź błędu
        expect(jsonMock).toBeCalledWith(expect.objectContaining({
            success: false,
            message: "JWT_ACCESS"
        }));
        expect(next).not.toBeCalled();

        // Przywracamy domyślną wartość dla kolejnych testów
        vi.stubEnv('JWT_ACCESS_SECRET', 'test_secret');
    });

    it('powinien zwrócić błąd gdy nie podano tokenu', async () => {
        // GIVEN: Brak tokenu w ciasteczkach
        const req = { signedCookies: {} } as unknown as Request;
        const jsonMock = vi.fn();
        const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
        const res = { status: statusMock } as unknown as Response;
        const next = vi.fn();

        // WHEN: Wywołanie middleware
        await authenticate(req, res, next);

        // THEN: Status BAD_REQUEST (400) i komunikat o błędzie
        expect(statusMock).toBeCalledWith(StatusCodes.BAD_REQUEST);
        expect(jsonMock).toBeCalledWith(expect.objectContaining({
            success: false,
            message: "JWT"
        }));
        expect(next).not.toBeCalled();
    });

    it('powinien zwrócić kod FORBIDDEN gdy weryfikacja tokenu nie powiedzie się', async () => {
        // GIVEN: Nieprawidłowy token JWT
        const req = {
            signedCookies: { JWT: 'nieprawidlowy_token' }
        } as unknown as Request;

        const sendStatusMock = vi.fn();
        const res = { sendStatus: sendStatusMock } as unknown as Response;
        const next = vi.fn();

        // WHEN: Wywołanie middleware - przechwytujemy błąd weryfikacji
        try {
            await authenticate(req, res, next);
        } catch (error) {
            // Ignorujemy błąd JWT - jest on oczekiwany w tym teście
        }

        // THEN: Status FORBIDDEN (403)
        expect(sendStatusMock).toBeCalledWith(StatusCodes.FORBIDDEN);
        expect(next).not.toBeCalled();
    });

    it('powinien dodać użytkownika do request i wywołać next() gdy token jest prawidłowy', async () => {
        // GIVEN: Dane użytkownika i prawidłowy token
        const mockUser = {
            id: 1,
            displayName: 'testuser',
            email: 'test@example.com',
            role: 'USER'
        };

        // Tworzenie prawdziwego tokenu JWT z naszym sekretnym kluczem testowym
        const JWT: string = process.env.JWT_ACCESS_SECRET || "";
        const validToken = jwt.sign(mockUser, JWT);

        const req = {
            signedCookies: { JWT: validToken },
            user: undefined
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn();

        // Mockowanie odpowiedzi z bazy danych
        (mockPrisma.user.findFirst as any).mockResolvedValue(mockUser);

        // WHEN: Wywołanie middleware
        await authenticate(req, res, next);

        // THEN: Next jest wywołany i użytkownik dodany do request
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user?.id).toEqual(mockUser.id);
        expect(req.user?.displayName).toEqual(mockUser.displayName);
        expect(req.user?.email).toEqual(mockUser.email);
    });
});