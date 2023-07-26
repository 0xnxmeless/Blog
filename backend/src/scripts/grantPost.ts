import prisma from "../db";
import prompts from "prompts";
import argon2, { argon2id } from "argon2";
import { User } from "@prisma/client";

(async () => {
    let user: User;
    const response = await prompts([
        {
            type: "text",
            name: "username",
            message:
                "What's the username of the account to grant permissions to?",
            validate: async (value) => {
                const u = await prisma.user.findUnique({
                    where: {
                        username: value,
                    },
                });

                if (!u)
                    return "Could not find a user with that name. Ensure you have created an account with that name via the frontend before using this script.";
                user = u;

                return true;
            },
        },
        {
            type: "toggle",
            name: "canPost",
            initial: !user?.canPost ?? false,
            message: "Grant post permissions?",
        },
    ]);

    await prisma.user.update({
        where: {
            uuid: user.uuid,
        },
        data: {
            canPost: response.canPost,
        },
    });

    console.log("Successfully updated user.");
})();
