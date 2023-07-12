import { Router, Request, Response, NextFunction } from "express";
import AuthRouter from "./AuthRouter";
import PostsRouter from "./PostsRouter";
import { StringsOnly } from "../middleware";

const router = Router();

router.use("/auth", StringsOnly, AuthRouter);
router.use("/posts", StringsOnly, PostsRouter);

router.use((_req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found.",
    });
    next();
});

export default router;
