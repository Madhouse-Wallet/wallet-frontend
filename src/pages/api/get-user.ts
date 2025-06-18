import type { NextApiRequest, NextApiResponse } from 'next';
import { lambdaInvokeFunction } from "../../lib/apiCall";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const apiResponse = await lambdaInvokeFunction(req.body, "madhouse-backend-production-getUser") as any;
        if (apiResponse?.status == "success") {
            return res.status(200).json({ status: "success", message: apiResponse?.message, userId: apiResponse?.data });
        } else {
            return res.status(400).json({ status: "failure", message: apiResponse?.message, error: apiResponse?.error });
        }
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
