import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import http from "http";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 5000;

// Autoryzacja użytkownika (JWT)
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "password") {
        const token = jwt.sign({ username }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        res.json({ token });
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
        "-i", "video.mp4",
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
    res.send("Test endpoint");
});

// Socket.io – Live Chat
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("message", (data) => io.emit("message", data));
    socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
