import { Router, Request, Response } from "express";
import prisma from "../db";
import { StringsOnly, User } from "../middleware";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    const posts = await prisma.post.findMany({
        select: {
            id: true,
            title: true,
            poster: {
                select: {
                    uuid: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true,
                },
            },
            replies: {
                select: {
                    content: true,
                    poster: {
                        select: {
                            uuid: true,
                            firstName: true,
                            lastName: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });

    return res.json({
        success: true,
        message: "Successfully retrieved posts.",
        data: posts,
    });
});

router.post("/", StringsOnly, User, async (req: Request, res: Response) => {
    if (!req.body)
        return res.status(400).json({
            success: false,
            message: "No request body provided.",
        });

    if (!req.user.canPost)
        return res.status(403).json({
            success: false,
            message: "You do not have permission to create posts.",
        });

    const { title, content, thumbnail } = req.body;

    if (!title || !content)
        return res.status(400).json({
            success: false,
            message:
                "One or more required fields from the request body are missing.",
        });

    const post = await prisma.post.create({
        data: {
            title,
            content,
            thumbnail: thumbnail ?? null,
            posterId: req.user.uuid,
        },
    });

    return res.json({
        success: true,
        message: "Successfully created post.",
        data: post,
    });
});

export default router;
