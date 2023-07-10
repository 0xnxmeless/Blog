import prisma from "../db";
import { Request, Response, NextFunction } from "express";
import { daysFromNow } from "../utils";

const StringsOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) return next();

    for (const index in req.body) {
        const field = req.body[index];
        if (typeof field !== "string") delete req.body[index];
    }

    return next();
};

type FieldWithType = {
    name: string;
    type:
        | "string"
        | "number"
        | "boolean"
        | "bigint"
        | "symbol"
        | "undefined"
        | "object"
        | "function";
};

const ExplicitTypes =
    (fields: FieldWithType[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (!req.body) return next();

        for (const field in fields) {
            const fieldName = fields[field].name;
            const fieldType = fields[field].type;

            if (typeof req.body[fieldName] !== fieldType)
                delete req.body[fieldName];
        }

        return next();
    };

const User = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.session;

    if (!token)
        return res.status(401).json({
            success: false,
            message: "You must be logged in to perform this action.",
        });

    const session = await prisma.session.findUnique({
        where: {
            token,
        },
    });

    if (!session)
        return res.status(401).json({
            success: false,
            message: "You must be logged in to perform this action.",
        });

    if (new Date(session.expiresAt) < new Date()) {
        await prisma.session.delete({
            where: {
                token,
            },
        });

        return res.status(401).json({
            success: false,
            message: "You must be logged in to perform this action.",
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            uuid: session.userId,
        },
    });

    if (!user) {
        await prisma.session.delete({
            where: {
                token,
            },
        });

        return res.status(401).json({
            success: false,
            message: "You must be logged in to perform this action.",
        });
    }

    const newSession = await prisma.session.update({
        where: {
            token,
        },
        data: {
            expiresAt: daysFromNow(1),
        },
    });

    res.cookie("session", newSession.token, {
        expires: newSession.expiresAt,
    });

    req.user = user;
    req.session = session;

    return next();
};

const Optional = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.session;

    if (!token)
        return next();

    const session = await prisma.session.findUnique({
        where: {
            token,
        },
    });

    if (!session)
        return next();

    if (new Date(session.expiresAt) < new Date()) {
        await prisma.session.delete({
            where: {
                token,
            },
        });

        return next();
    }

    const user = await prisma.user.findUnique({
        where: {
            uuid: session.userId,
        },
    });

    if (!user) {
        await prisma.session.delete({
            where: {
                token,
            },
        });

        return next();
    }

    const newSession = await prisma.session.update({
        where: {
            token,
        },
        data: {
            expiresAt: daysFromNow(1),
        },
    });

    res.cookie("session", newSession.token, {
        expires: newSession.expiresAt,
    });

    req.user = user;
    req.session = session;

    return next();
};

export { StringsOnly, ExplicitTypes, User, Optional };
