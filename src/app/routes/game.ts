import express from "express";

const router = express.Router();

router.get("/start", (req: any, res) => {
    req.helpers.io.emit("game started");

    res.send({success: true});
});

export default router;
