import { Router, Request, Response } from "express";
import argon2, { argon2id } from "argon2";
import { daysFromNow, generateSessionToken } from "../utils";
import prisma from "../db";
import { Optional, User } from "../middleware";

const router = Router();
const validUsernameRegex = /^[a-zA-Z0-9\_]+$/;
const validNameRegex = /^[a-zA-Z 0-9]+$/;

router.post("/register", async (req: Request, res: Response) => {
    if (!req.body)
        return res.status(400).json({
            success: false,
            message: "No request body provided.",
        });

    const { username, password, firstName, lastName } = req.body;

    if (!username || !password)
        return res.status(400).json({
            success: false,
            message:
                "One or more required fields from the request body are missing.",
        });

    if ((firstName && !lastName) || (!firstName && lastName))
        return res.status(400).json({
            success: false,
            message: "You must provide both a first and a last name.",
        });

    if (username.length > 16)
        return res.status(400).json({
            success: false,
            message: "Usernames cannot exceed 16 characters in length.",
        });

    if (username.length < 3)
        return res.status(400).json({
            success: false,
            message: "Username must be at least 3 characters in length.",
        });

    if (!validUsernameRegex.test(username))
        return res.status(400).json({
            success: false,
            message: "Usernames must be alphanumeric.",
        });

    if (firstName && firstName.length > 50)
        return res.status(400).json({
            success: false,
            message: "First names cannot exceed 50 characters in length.",
        });

    if (!validNameRegex.test(firstName))
        return res.status(400).json({
            success: false,
            message: "First names must be alphanumeric.",
        });

    if (lastName && lastName.length > 50)
        return res.status(400).json({
            success: false,
            message: "Last names cannot exceed 50 characters in length.",
        });

    if (!validNameRegex.test(lastName))
        return res.status(400).json({
            success: false,
            message: "Last names must be alphanumeric.",
        });

    if (password.length < 8)
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters in length.",
        });

    if (password.length > 250)
        return res.status(400).json({
            success: false,
            message: "Password cannot exceed 250 characters in length.",
        });

    const existingUser = await prisma.user
        .findUnique({
            where: {
                username,
            },
        })
        .catch(() =>
            res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            })
        );

    if (existingUser)
        return res.status(400).json({
            success: false,
            message: "A user with that username already exists.",
        });

    const hashedPassword = await argon2
        .hash(password, {
            type: argon2id,
        })
        .catch(() =>
            res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            })
        );

    await prisma.user
        .create({
            data: {
                username,
                password: hashedPassword.toString(),
                firstName: firstName ?? null,
                lastName: lastName ?? null,
            },
        })
        .catch(() =>
            res.status(500).json({
                success: false,
                message: "A server error has occurred.",
            })
        );

    return res.json({
        success: true,
        message: "Successfully registered.",
    });
});

router.post("/login", Optional, async (req: Request, res: Response) => {
    if (req.user)
        return res.status(400).json({
            success: false,
            message: "You are already logged in.",
        });
    
    if (!req.body)
        return res.status(400).json({
            success: false,
            message: "No request body provided.",
        });

    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({
            success: false,
            message:
                "One or more required fields from the request body are missing.",
        });

    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    if (!user)
        return res.status(400).json({
            success: false,
            message: "Invalid username or password.",
        });

    const matches = await argon2.verify(user.password, password).catch(() =>
        res.status(500).json({
            success: false,
            message: "A server error has occurred.",
        })
    );

    if (!matches)
        return res.status(400).json({
            success: false,
            message: "Invalid username or password.",
        });

    const session = await prisma.session.create({
        data: {
            userId: user.uuid,
            token: generateSessionToken(),
            expiresAt: daysFromNow(1),
        },
    });

    res.cookie("session", session.token, {
        expires: session.expiresAt,
    });

    return res.json({
        success: true,
        message: "Successfully logged in.",
    });
});

export default router;
