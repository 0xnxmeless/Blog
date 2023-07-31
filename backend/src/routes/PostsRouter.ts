import { Router, Request, Response } from "express";
import prisma from "../db";
import { StringsOnly, User } from "../middleware";
import { Post } from "@prisma/client";

const router = Router();

router
    .route("/")
    .get(async (_req: Request, res: Response) => {
        let posts;
        try {
            posts = await prisma.post.findMany({
                select: {
                    uuid: true,
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
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        return res.json({
            success: true,
            message: "Successfully retrieved posts.",
            data: posts,
        });
    })
    .post(StringsOnly, User, async (req: Request, res: Response) => {
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

        let post;
        try {
            post = await prisma.post.create({
                data: {
                    title,
                    content,
                    thumbnail: thumbnail ?? null,
                    posterId: req.user.uuid,
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        return res.json({
            success: true,
            message: "Successfully created post.",
            data: post,
        });
    });

router
    .route("/:id")
    .get(async (req: Request, res: Response) => {
        let post;
        try {
            post = await prisma.post.findUnique({
                where: {
                    uuid: req.params.id,
                },
                select: {
                    uuid: true,
                    title: true,
                    content: true,
                    poster: {
                        select: {
                            avatar: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    replies: {
                        select: {
                            poster: {
                                select: {
                                    avatar: true,
                                    username: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                            content: true,
                        },
                    },
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        if (!post)
            return res.status(400).json({
                success: false,
                message: "Could not find that post.",
            });

        return res.json({
            success: true,
            message: "Successfully retrieved post.",
            data: post,
        });
    })
    .post(User, async (req: Request, res: Response) => {
        if (!req.body)
            return res.status(400).json({
                success: false,
                message: "No request body provided.",
            });

        const { content } = req.body;

        if (!content)
            return res.status(400).json({
                success: false,
                message:
                    "One or more required fields from the request body were missing.",
            });

        let post;
        try {
            post = await prisma.post.findUnique({
                where: {
                    uuid: req.params.id,
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        if (!post)
            return res.status(400).json({
                success: false,
                message: "Could not find that post.",
            });

        try {
            await prisma.postReply.create({
                data: {
                    content,
                    posterId: req.user.uuid,
                    postId: post.uuid,
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        return res.json({
            success: true,
            message: "Successfully posted reply.",
        });
    })
    .patch(User, async (req: Request, res: Response) => {
        if (!req.user.canPost)
            return res.status(401).json({
                success: false,
                message: "You do not have permission to edit posts.",
            });

        if (!req.body)
            return res.status(400).json({
                success: false,
                message: "No request body provided.",
            });

        let post;
        try {
            post = await prisma.post.findUnique({
                where: {
                    uuid: req.params.id,
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        if (!post)
            return res.status(400).json({
                success: false,
                message: "Could not find that post.",
            });

        if (post.posterId !== req.user.uuid)
            return res.status(403).json({
                success: false,
                message: "You do not have permission to edit this post.",
            });

        const { title, content, thumbnail } = req.body;

        if (!title && !content && !thumbnail)
            return res.status(400).json({
                success: false,
                message: "No fields to update were provided.",
            });

        let newPost;
        try {
            newPost = await prisma.post.update({
                where: {
                    uuid: post.uuid,
                },
                data: {
                    title: title ?? post.title,
                    content: content ?? post.content,
                    thumbnail: thumbnail ?? post.thumbnail,
                    updatedAt: new Date(),
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        return res.json({
            success: true,
            message: "Successfully updated post.",
            data: newPost,
        });
    })
    .delete(User, async (req: Request, res: Response) => {
        let post;
        try {
            post = await prisma.post.findUnique({
                where: {
                    uuid: req.params.id,
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        if (!post)
            return res.status(400).json({
                success: false,
                message: "Could not find that post.",
            });

        if (post.posterId !== req.user.uuid)
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to delete other users' posts.",
            });

        try {
            await prisma.post.delete({
                where: {
                    uuid: post.uuid,
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            });
        }

        return res.json({
            success: true,
            message: "Successfully deleted post.",
        });
    });

export default router;
