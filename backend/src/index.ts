import listen from "./app";
import { config } from "dotenv";
import prisma from "./db";

config();

const verifyConnection = () =>
    new Promise<void>(async (resolve, reject) => {
        await prisma.user.findMany().catch(reject);
        resolve();
    });

verifyConnection().then(() => {
    console.log("Database connection successful.");
    listen(parseInt(process.env.PORT!)).then(() =>
        console.log(`Server listening on port ${process.env.PORT}`)
    );
});
