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

const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "../../public")));

app.use((req: any, res, next) => {
    if (!req.hasOwnProperty("helpers")) {
        req.helpers = {};
    }
    req.helpers.io = io;

    const token = (req.headers.authorization || "").toLowerCase().replace("bearer ", "");

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

const statePerPlayerId: any = {};

io.on("connection", (socket) => {
    socket.on("query update", (state) => {
        statePerPlayerId[state.playerId] = state.query;
        io.emit("progress update", Object.keys(statePerPlayerId).map((playerKey) => {
            return {
                avatarUrl: `https://di-game-api.maartendev.me/avatars/${playerKey}.jpeg`,
                playerId: playerKey,
                query: statePerPlayerId[playerKey].substr(0, 100000),
            };
        }));
    });
});

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);
app.use("/challenges", challengesRoutes);

server.listen(port);
export default app;
