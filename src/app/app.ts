import * as bodyParser from "body-parser";
import express from "express";
import {createServer} from "http";
import * as path from "path";
import socketServer, {Server} from "socket.io";
import {APP_PORT} from "./config";
import TransportListener from "./domain/EventListeners/TransportListener";
import authorizationMiddleware from "./domain/middleware/authorizationMiddleware";
import crossOriginMiddleware from "./domain/middleware/crossOriginMiddleware";
import globalHelperMiddleware from "./domain/middleware/globalHelperMiddleware";
import authRoutes from "./routes/auth";
import challengesRoutes from "./routes/challenges";
import gameRoutes from "./routes/game";

const app = express();
const server = createServer(app);
const io: Server = socketServer(server);
(new TransportListener()).start(io);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "../../public")));
app.use(authorizationMiddleware);
app.use(crossOriginMiddleware);
app.use(globalHelperMiddleware(io));

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);
app.use("/challenges", challengesRoutes);

server.listen(APP_PORT);

export default app;
