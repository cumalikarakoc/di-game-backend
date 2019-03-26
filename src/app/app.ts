import * as bodyParser from "body-parser";
import express from "express";
import {createServer} from "http";
import * as path from "path";
import socketServer, {Server} from "socket.io";
import TransportListener from "./domain/EventListeners/TransportListener";
import authorizationMiddleware from "./domain/Middleware/authorizationMiddleware";
import crossOriginMiddleware from "./domain/Middleware/crossOriginMiddleware";
import globalHelperMiddleware from "./domain/Middleware/globalHelperMiddleware";
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

server.listen(3001);

export default app;
