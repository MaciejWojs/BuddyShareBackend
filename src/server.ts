import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import * as dotenv from "dotenv";

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Autoryzacja użytkownika (JWT)
app.post("/login", (req, res) => {
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
    res.send("Test endpoint success");
});


app.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:' + PORT);
});