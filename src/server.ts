import * as dotenv from 'dotenv';
import app from './app';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { setupSocketServer } from './socket';
import { sql } from 'bun';
import axios from 'axios';

dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Zastąp obecną obsługę beforeExit tymi obsługami sygnałów
const handleShutdown = async () => {
  console.log('Program prawie się kończy...');

  try {
    if (process.env.DC_WEBHOOK_URL) {
      const response = await axios.post(process.env.DC_WEBHOOK_URL, {
        content: 'BACKEND ZAMYKA SIĘ',
        username: 'BuddyShareBackend'
      });
      console.log('Powiadomienie wysłane:', response.data);
    }
    await sql`Update stream_options set "isLive" = false`;
    console.log('...ale jeszcze coś zrobiliśmy.');
  } catch (error) {
    console.error('Błąd podczas aktualizacji bazy danych:', error);
  } finally {
    process.exit(0);
  }
};

// Obsługa sygnałów zamknięcia (Ctrl+C, zamykanie procesu, itp.)
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: `http://${process.env.FRONT_HOST}:${process.env.FRONT_PORT || 5000}`,
    credentials: true
  }
});

setupSocketServer(io);

export { io };

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});