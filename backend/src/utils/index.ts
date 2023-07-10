const randomString = (length: number, additionalChars?: string) => {
    const chars =
        "012456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/-" +
        additionalChars;
    let result = "";
    for (let i = 0; i < length; i++)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

const generateSessionToken = () => randomString(250);
const daysFromNow = (days: number) =>
    new Date(Date.now() + 60 * 60 * 24 * 1000 * days);

export { randomString, generateSessionToken, daysFromNow };
