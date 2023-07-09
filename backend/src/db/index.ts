import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

declare type User = {
    uuid?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    posts?: Array<Object>;
    sessions?: Array<Object>;
    createdAt?: Date;
    updatedAt?: Date;
};

declare type Session = {
    id?: number;
    userId?: string;
    token?: string;
    expiresAt?: Date;
};

declare global {
    namespace Express {
        interface Request {
            user: User;
            session: Session;
        }
    }
}

export default prisma;
