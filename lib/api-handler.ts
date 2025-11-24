// lib/api-handler.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

// 1. Init cors middleware
const cors = Cors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    origin: "*", // 👈 allow all origins (or replace with your frontend domain)
});

// 2. Helper to run middleware
function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: (...args: any[]) => void
) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: unknown) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// 3. Export wrapper
export function withCors(handler: (req: NextApiRequest, res: NextApiResponse) => unknown) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        await runMiddleware(req, res, cors);

        // Handle OPTIONS requests quickly
        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }

        return handler(req, res);
    };
}
