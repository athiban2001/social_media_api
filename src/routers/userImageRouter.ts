import { Router } from "express";
import path from "path";
import { User } from "../entity/User.entity";

export const userImageRouter = Router();
userImageRouter.get("/db/user/:id", async (req, res) => {
    const user = await User.findOne(req.session!.userId);
    if (req.params.id === "default") {
        res.setHeader("Content-Type", "image/jpeg");
        res.sendFile(path.join(__dirname, "../uploads/user/default.jpg"));
        return;
    }

    const profileUser = await User.findOne(req.params.id);
    if (!user || !profileUser) {
        res.status(404).send(new Error("Not found"));
        return;
    }

    res.setHeader("Content-Type", "image/png");
    res.sendFile(path.join(__dirname, `../uploads/user/${profileUser.id}.png`));
});
