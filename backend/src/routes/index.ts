import { Router, Request, Response, NextFunction } from "express";
import AuthRouter from "./AuthRouter";
import { StringsOnly } from "../middleware";

const router = Router();

router.use("/auth", StringsOnly, AuthRouter);

router.use((_req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found.",
    });
    next();
});

export default router;
