import {Server} from "socket.io";

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
                avatarUrl: `https://di-game-api.maartendev.me/avatars/${playerKey}.jpeg`,
                playerId: playerKey,
                query: this.statePerPlayerId[playerKey].substr(0, 100000),
            };
        });
    }
}

export default TransportListener;
