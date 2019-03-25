import * as express from "express";
const router = express.Router();
import fs from "fs";
import path from "path";
import uuid4 from "uuid/v4";

const authenticatedPlayers: any[] = [];

router.post("/login", (req: any, res) => {
  const {playerId}  = req.body;

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

  if (!fs.existsSync(path.join(__dirname, "../../public/" + localUserPath))) {
    return res.send({
      success: false,
      validation: {
        errors: ["Unknown user!"],
        message: "",
      },
    });
  }

  const user = {
    avatarUrl: "http://localhost:3001/" + localUserPath,
    id: playerId,
    level: 0,
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

export default router;
