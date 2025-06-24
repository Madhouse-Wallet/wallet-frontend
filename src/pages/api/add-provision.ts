import type { NextApiRequest, NextApiResponse } from 'next';
import { addLnbitTposUser, addLnbitSpendUser } from "./create-lnbitUser";
import { checkLnbitCreds } from "../../lib/apiCall"
import { lambdaInvokeFunction } from "../../lib/apiCall";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // Validate email
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Invalid email' });
        }
        const apiResponse = await lambdaInvokeFunction({ email }, "madhouse-backend-production-getUser") as any;
        if (apiResponse?.status == "success") {
            let existingUser = apiResponse?.data;
            if (existingUser) {
                checkLnbitCreds({
                    "madhouseWallet": existingUser?.wallet,
                    "email": email
                })
            }
        }
        return res.status(201).json({ status: "success", message: 'User added successfully', userData: {} });
    } catch (error) {
        console.error('Error adding user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '3mb',
        },
    },
};
