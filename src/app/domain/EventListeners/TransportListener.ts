import {Server} from "socket.io";
import {APP_URL} from "../../config";

class TransportListener {
    private statePerPlayerId: { [playerId: string]: string } = {};

    public start(io: Server) {
        io.on("connection", (socket) => {
            socket.on("query update", (state) => {
                this.statePerPlayerId[state.playerId] = state.query;
                io.emit("progress update", this.getLatestState());
            });
        });
    }

    private getLatestState() {
        return Object.keys(this.statePerPlayerId).map((playerKey) => {
            return {
                avatarUrl: `${APP_URL}/avatars/${playerKey}.jpeg`,
                playerId: playerKey,
                query: this.statePerPlayerId[playerKey].substr(0, 100000),
            };
        });
    }
}

export default TransportListener;
