import * as dotenv from 'dotenv';
import app from './app';

dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});