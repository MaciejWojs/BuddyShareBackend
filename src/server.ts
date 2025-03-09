import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import * as dotenv from "dotenv";

import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { generateSwaggerDocsJsonFIle } from './swagger';

dotenv.config();
const app = express();

generateSwaggerDocsJsonFIle().then(() => {

    const swaggerFilePath = path.join(__dirname, 'swagger.json');

    // Read the Swagger JSON file
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf-8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
});
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Autoryzacja użytkownika (JWT)
app.post("/login", (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint do logowania użytkownika.'

    const { username, password } = req.body;
    if (username === "admin" && password === "password") {
        console.log("User logged in:");
    } else {
        res.status(401).send("Unauthorized");
    }
});

// Strumieniowanie HLS
app.get("/stream", (_req: express.Request, res: express.Response) => {
    res.writeHead(200, {
        "Content-Type": "video/mp4"
    });

    if (!fs.existsSync("/videos/video.mp4")) {
        console.error("File not found");
        res.status(404).send("File not found");
        return;
    }

    const ffmpeg = spawn("ffmpeg", [
        "-re",
        "-i", "/videos/video.mp4",
        "-c:v", "libx264",
        "-b:v", "1M",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-movflags", "frag_keyframe+empty_moov",
        "-f", "mp4",
        "pipe:1"
    ]);

    ffmpeg.stdout.pipe(res);
    ffmpeg.stderr.on("data", (data: Buffer) => console.error(data.toString()));
});

app.get("/test", (req, res) => {
    res.send("Test endpoint success!!!");
});


app.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:' + PORT);
});