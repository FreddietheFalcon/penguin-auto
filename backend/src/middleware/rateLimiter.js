import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        const { success } = await ratelimit.limit("penguin-auto-limit");
        if (!success) {
            return res.status(429).json({
                message: "Too many requests, please try again later",
            });
        }
        next();
    } catch (error) {
        // If Upstash fails, log the error but allow the request through
        // This prevents Upstash issues from taking down the whole app
        console.error("Rate limit error", error.message);
        next();
    }
};

export default rateLimiter;
