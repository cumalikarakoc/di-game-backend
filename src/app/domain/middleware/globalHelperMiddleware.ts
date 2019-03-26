import {Server} from "socket.io";

export default (io: Server) => (req: any, res: any, next: any) => {
    if (!req.hasOwnProperty("helpers")) {
        req.helpers = {};
    }
    req.helpers.io = io;

    next();
};
