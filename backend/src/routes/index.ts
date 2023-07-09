import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.use((_req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found.",
    });
    next();
});

export default router;
