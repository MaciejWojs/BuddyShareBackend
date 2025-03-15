// Node.js built-in modules
import { spawn } from "child_process";
import fs from 'fs';
import path from 'path';

// Third-party dependencies
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import swaggerUi from 'swagger-ui-express';
import { PrismaClient, Role } from '@prisma/client'
import * as EmailValidator from 'email-validator';
import * as jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

// Local imports
import { generateSwaggerDocsJsonFIle } from './swagger';
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { getPasswordHash } from './utils/hash';

dotenv.config();
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const FRONT_PORT = process.env.FRONT_PORT ? parseInt(process.env.FRONT_PORT) : 5000;

generateSwaggerDocsJsonFIle().then(() => {
    const swaggerFilePath = path.join(__dirname, 'swagger.json');
    // Read the Swagger JSON file
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf-8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
});

const corsOptions = {
    origin: 'http://localhost:' + FRONT_PORT,
    optionsSuccessStatus: 200, 
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));
const secretKey = process.env.COOKIE_SECRET;
if (!secretKey) {
    console.error("COOKIE_SECRET is not defined");
    process.exit(1);
}
app.use(cookieParser(secretKey));
const prisma = new PrismaClient();


const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
if (!JWT_ACCESS_SECRET) {
    console.error("JWT_ACCESS_SECRET is not defined");
    process.exit(1);
}

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!JWT_ACCESS_SECRET) {
        res.json({ success: false, message: "JWT_ACCESS" });
        return;
    }

    const token = req.signedCookies['JWT'];
    // console.log("Cookie: " + token);

    if (!token) {
        res.json({ success: false, message: "JWT" });
        return;
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err: jwt.VerifyErrors | null, user: any) => {
        if (err) {
            res.sendStatus(StatusCodes.FORBIDDEN);
            return;
        }
        // req.user = user;
        next();
    });
}

// Autoryzacja użytkownika (JWT)
app.post("/login", (_req: express.Request, res: express.Response): void => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint do logowania użytkownika.'

    const { username, reqHASH }: { username: string, reqHASH: string } = _req.body;
    if (!username || !reqHASH) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ReasonPhrases.BAD_REQUEST });
        return;
    }
    const email = EmailValidator.validate(username) ? username : null;
    const loginField = email ? { email } : { displayName: username };

    prisma.user.findFirst({
        where: {
            ...loginField,
            passwordHash: reqHASH
        }
    }).then((user) => {
        if (user) {
            const prismaUser = { username: user.displayName, role: user.role };
            const token = jwt.sign(prismaUser, JWT_ACCESS_SECRET, { expiresIn: "1h" });
            console.log("User logged in:", user.displayName + " role: " + user.role + " email: " + user.email);
            res.cookie('JWT', token, { signed: true, httpOnly: true, secure: true })
                .json({ success: true, message: ReasonPhrases.OK });
        } else {
            console.log("Login Failed:");
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: ReasonPhrases.UNAUTHORIZED });
        }
    }).catch((error) => {
        console.error("Failed to login user:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
});

// Rejestracja użytkownika
app.post("/register", async (_req: express.Request, res: express.Response) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint do rejestracji użytkownika.'
    const { username, email, password }: { username: string, email: string, password: string } = _req.body;
    // console.log("Username: " + username);
    // console.log("Email: " + email);
    // console.log("Password " + password);

    if (!username || !email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ReasonPhrases.BAD_REQUEST });
        return;
    }

    const isCorrectEmail = EmailValidator.validate(email);
    if (!isCorrectEmail) {
        console.log("Invalid email");
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ReasonPhrases.BAD_REQUEST });
        return;
    }
    console.log("Generating hash for password...");
    const HASH = getPasswordHash(password);
    // console.log(HASH);

    if (!HASH) {
        console.log("Failed to generate hash");
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ReasonPhrases.INTERNAL_SERVER_ERROR });
        return;
    }
    console.log("Hash generated successfully");

    console.log("Creating user in database...");
    try {
        const exist_displayName = await prisma.user.findFirst({
            where: {
                displayName: username
            }
        });
        const exist_email = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (exist_displayName) {
            console.log(`User with this username ${username} already exists`);
            res.status(StatusCodes.CONFLICT).json({ success: false, cause: "username" });
            return;
        }

        if (exist_email) {
            console.log(`User with this email ${email} already exists`);
            res.status(StatusCodes.CONFLICT).json({ success: false, cause: "email" });
            return;
        }

        const usr = await prisma.user.create({
            data: {
                displayName: username,
                email: email,
                passwordHash: HASH,
                lastLogin: new Date()
            }
        });
        console.log("User created successfully:", username);
        console.log("User role", usr.role);
        res.json({ success: true, message: ReasonPhrases.OK });
    } catch (error) {
        console.error("Failed to create user:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
});

app.get("/auth-test", authenticate, (req: express.Request, res: express.Response): void => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint do testowania autoryzacji użytkownika.'
    res.json({ success: true, message: ReasonPhrases.OK });

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

app.get("/test", authenticate, async (req, res) => {
    res.send("Test endpoint success!!!");
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:' + PORT);
});