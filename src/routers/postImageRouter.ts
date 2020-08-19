import { Router } from "express";
import path from "path";
import { Post } from "../entity/Post.entity";
import { User } from "../entity/User.entity";

export const postImageRouter = Router();

postImageRouter.get("/db/user/:id", async (req, res) => {
    const user = await User.findOne(req.session!.userId);
    const post = await Post.findOne(req.params.id);
    if (!user || !post) {
        res.status(404).send(new Error("Not found"));
        return;
    }

    res.setHeader("Content-type", "image/png");
    res.sendFile(path.join(__dirname, `../uploads/post/${post.id}.png`));
});
