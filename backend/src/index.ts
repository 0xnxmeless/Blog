import listen from "./app";
import { config } from "dotenv";
import prisma from "./db";
import createLogger from "logging";

config();

const logger = createLogger("backend");

const verifyConnection = () =>
    new Promise<void>(async (resolve, reject) => {
        await prisma.user.findMany().catch(reject);
        resolve();
    });

verifyConnection().then(() => {
    logger.info("Database connection successful.");
    listen(parseInt(process.env.PORT!)).then(() =>
        logger.info(`Server listening on port ${process.env.PORT}`)
    );
}).catch((err) => {
    logger.error("!!!! FAILED TO CONNECT TO DATABASE !!!!");
    logger.error("Aborting backend start");
    process.exit(1);
});
