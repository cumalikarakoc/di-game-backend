import * as express from "express";
import Schema from "../models/Schema";
import Table from "../models/Table";

const router = express.Router();

let challengeIndex = 0;

const challenges = [
    {
        description: "Select brand from from car",
        schema: new Schema([new Table("car", ["brand"], [
            {brand: "BMW", max_speed: 138, color: "red"},
            {brand: "Opel", max_speed: 45, color: "blue"},
            {brand: "BMW", max_speed: 138, color: "red"},
        ])]),
    },
    {
        description: "Select age from person",
        schema: new Schema([new Table("person", ["age", "gender"], [
            {age: 33, gender: "F"},
            {age: 77, gender: "M"},
        ])]),
    },
];

router.get("/next", async (req: any, res) => {
    req.helpers.io.emit("next challenge", challenges[challengeIndex]);

    challengeIndex++;

    if (challengeIndex === challenges.length) {
        challengeIndex = 0;
    }

    return res.send({success: true});
});

export default router;
