import * as bodyParser from "body-parser";
import express from "express";
import {createServer} from "http";
import * as path from "path";
import socketServer from "socket.io";
import authRoutes from "./routes/auth";
import challengesRoutes from "./routes/challenges";
import gameRoutes from "./routes/game";
const app = express();
const server = createServer(app);
const io = socketServer(server);

const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use((req: any, res, next) => {
    if (!req.hasOwnProperty("helpers")) {
        req.helpers = {};
    }
    req.helpers.io = io;

    const token = req.headers.Authorization || "".replace("Bearer ", "");

    req.auth = {
        isAuthenticated: token !== "",
        token,
    };

    next();
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);
app.use("/challenges", challengesRoutes);

server.listen(port);
export default app;
