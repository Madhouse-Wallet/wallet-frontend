import type { NextApiRequest, NextApiResponse } from 'next';
import { logIn, getUser } from "./lnbit";
import { lambdaInvokeFunction } from "../../lib/apiCall";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, type = "", webAuthKey = "", ensName = "" } = req.body;
        // Connect to the database

        // Validate email
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ status: "failure", error: 'Invalid email' });
        }

        const apiResponse = await lambdaInvokeFunction({ email }, "madhouse-backend-production-getUser") as any;
        if (apiResponse?.status == "success") {
            let existingUser = apiResponse?.data;
            if (existingUser) {
                //   return res.status(400).json({ error: 'Email already exists' });
                const getToken = await logIn(2) as any;
                let token = getToken?.data?.token
                let data = await getUser(existingUser?.lnbitId_3, token, 2) as any;
                return res.status(200).json({ status: "success", message: 'User fetched successfully', adminId: data?.data?.wallets[0]?.adminkey });
            }
        } else {
            return res.status(400).json({ status: "failure", message: 'No User Found!' });
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
