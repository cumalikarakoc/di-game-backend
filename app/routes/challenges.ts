import * as express from "express";

const router = express.Router();
import sqlPool from "../database/connection";
import QueryBuilder from "../models/DSL/Parsers/QueryBuilder";
import QueryDescriptionBuilder from "../models/DSL/Parsers/QueryDescriptionBuilder";
import ChallengeService from "../services/ChallengeService";
import SchemaAnalyzer from "../services/SchemaAnalyzer";
import SchemaSeeder from "../services/SchemaSeeder";
import SqlGeneratorService from "../services/SqlGeneratorService";

const challengeService = new ChallengeService(new SqlGeneratorService(), new QueryBuilder(), new QueryDescriptionBuilder(), new SchemaSeeder(), new SchemaAnalyzer());

let hasConnected = false;

router.get("/next", async (req: any, res) => {
    // if (!req.auth.isAuthenticated) {
    //     return res.json({success: false, error: "Unauthorized"});
    // }

    const userId = req.auth.token || "aaa-bbb";

    const challenge = challengeService.generateRandomChallenge();

    const test = "opef";
    if (!hasConnected) {
        await sqlPool.connect();
        hasConnected = true;
    }
    await sqlPool.query`DELETE FROM challenges WHERE user_id=${userId}`;
    await sqlPool.query`INSERT INTO challenges (description, setup_sql, solution_sql, seed_data_sql, user_id) VALUES (${challenge.description}, ${challenge.initialSetupSql}, ${challenge.solutionSql}, ${test}, ${userId})`;

    res.send(challenge);
});

router.get("/verify", (req, res) => {
    const {challengeId} = req.body;

});

export default router;
