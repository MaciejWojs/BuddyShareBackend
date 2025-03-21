import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import express from 'express';
import * as expressTypes from '../src/types/express';


describe('Stream Routes', () => {
  let router: express.Router;
  
  beforeEach(async () => {
    vi.resetModules();
    router = (await import('../src/routes/streamRoutes')).default;
  });

  // Helper do testowania endpointów
  const testRoute = async (
    method: 'get' | 'post' | 'put' | 'delete',
    path: string, 
    body: any = {}, 
    params: any = {}, 
    isAuthenticated: boolean = false
  ) => {
    // Mock obiektów Request i Response
    const req = {
      body,
      params,
      user: isAuthenticated ? { id: 1, displayName: 'testuser' } : undefined
    } as unknown as Request;
    
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    const res = {
      status: statusMock,
      json: jsonMock
    } as unknown as Response;

    // Znajdź odpowiednią obsługę trasy
    const route = router.stack.find((layer: any) => {
      return layer.route && 
             layer.route.path === path && 
             layer.route.methods[method];
    });

    if (!route) {
      throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
    }

    // Wykonaj wszystkie middleware w kolejności
    for (const handler of route.route.stack) {
      if (handler.handle.length <= 3) { // standardowy handler (req, res, next)
        await handler.handle(req, res, () => {});
      }
    }

    return { req, res, statusMock, jsonMock };
  };

  // Testowanie poszczególnych tras
  describe('GET /', () => {
    it('should return all streams', async () => {
      const { statusMock, jsonMock } = await testRoute('get', '/');
      
      expect(statusMock).toBeCalledWith(200);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        message: 'Get all streams'
      }));
    });
  });

  describe('GET /:id', () => {
    it('should return stream by ID', async () => {
      const { statusMock, jsonMock } = await testRoute('get', '/:id', {}, { id: '123' });
      
      expect(statusMock).toBeCalledWith(200);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        message: 'Get stream with ID: 123'
      }));
    });
  });

  describe('POST /', () => {
    it('should require authentication', async () => {
      // Mockowanie middleware authenticate
      vi.mock('../src/middleware/authenticate', () => ({
        authenticate: (req: Request, res: Response, next: Function) => {
          if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
          }
          next();
        }
      }));

      // Niezalogowany użytkownik
      const unauthorized = await testRoute('post', '/', { title: 'Test Stream' }, {}, false);
      expect(unauthorized.statusMock).toBeCalledWith(401);

      // Zalogowany użytkownik
      const authorized = await testRoute('post', '/', { title: 'Test Stream' }, {}, true);
      expect(authorized.statusMock).toBeCalledWith(201);
      expect(authorized.jsonMock).toBeCalledWith(expect.objectContaining({
        message: 'Stream created',
        data: expect.objectContaining({ title: 'Test Stream' })
      }));
    });
  });

  describe('PUT /:id', () => {
    it('should update stream when authenticated', async () => {
      // Mockowanie middleware authenticate
      vi.mock('../src/middleware/authenticate', () => ({
        authenticate: (req: Request, res: Response, next: Function) => {
          if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
          }
          next();
        }
      }));

      const { statusMock, jsonMock } = await testRoute(
        'put', 
        '/:id', 
        { title: 'Updated Stream' }, 
        { id: '123' },
        true
      );
      
      expect(statusMock).toBeCalledWith(200);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        message: 'Update stream with ID: 123',
        data: expect.objectContaining({ title: 'Updated Stream' })
      }));
    });
  });

  describe('DELETE /:id', () => {
    it('should delete stream when authenticated', async () => {
      // Mockowanie middleware authenticate
      vi.mock('../src/middleware/authenticate', () => ({
        authenticate: (req: Request, res: Response, next: Function) => {
          if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
          }
          next();
        }
      }));

      const { statusMock, jsonMock } = await testRoute(
        'delete', 
        '/:id', 
        {}, 
        { id: '123' },
        true
      );
      
      expect(statusMock).toBeCalledWith(200);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        message: 'Delete stream with ID: 123'
      }));
    });
  });
});