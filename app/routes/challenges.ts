import * as express from "express";
const router = express.Router();
import ChallengeService from "../services/ChallengeService";
import SqlGeneratorService from "../services/SqlGeneratorService";
const challengeService = new ChallengeService(new SqlGeneratorService());

router.get("/next", (req, res) => {
    // if (!req.auth.isAuthenticated) {
    //     return res.json({success: false, error: "Unauthorized"});
    // }

    const challenge = challengeService.generateRandomChallenge();

    res.send(challenge);
});

router.get("/verify", (req, res) => {
    const {challengeId} = req.body;

});

export default router;
