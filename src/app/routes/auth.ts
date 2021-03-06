import * as express from "express";

const router = express.Router();
import fs from "fs";
import path from "path";
import uuid4 from "uuid/v4";
import {APP_URL} from "../config";

let authenticatedPlayers: any[] = [];

router.post("/login", (req: any, res) => {
    const {playerId} = req.body;

    if (authenticatedPlayers.some((player) => player.id === playerId)) {
        return res.send({
            success: false,
            validation: {
                errors: ["User already authenticated!"],
                message: "",
            },
        });
    }

    const localUserPath = `avatars/${playerId}.jpeg`;

    if (!fs.existsSync(path.join(__dirname, "../../../public/" + localUserPath))) {
        return res.send({
            success: false,
            validation: {
                errors: ["Unknown user!"],
                message: "",
            },
        });
    }

    const user = {
        avatarUrl: "https://di-game-api.maartendev.me/" + localUserPath,
        id: playerId,
        level: 22,
    };

    req.helpers.io.emit("player joined", user);
    authenticatedPlayers.push(user);

    return res.send({
        players: authenticatedPlayers,
        success: true,
        token: uuid4(),
        validation: {
            errors: [],
            message: "Welcome!",
        },
    });
});

router.get("/flush", (req: any, res) => {
    authenticatedPlayers = [];

    res.send({success: true});
});

router.get("/debug", (req: any, res) => {
    authenticatedPlayers = [];

    res.send({url: APP_URL});
});

export default router;
