import type { NextApiRequest, NextApiResponse } from 'next';
import { logIn, createInvoice } from "./lnbit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { amount } = req.body;
        const getToken = await logIn(2) as any;
        let token = getToken?.data?.token;
        const satoshiAmount = amount;
        let createInvoice1 = await createInvoice({
            "out": false,
            "unit": "sat",
            "amount": satoshiAmount,
            "memo": "invoice",
        }, token, 2) as any;
        console.log("createInvoice1-->",createInvoice1)
        if (createInvoice1?.status) {
            return res.status(200).json({ status: "success", message: 'Invoice Created!', data: { "invoice": createInvoice1?.data?.bolt11 } });
        } else {
            return res.status(400).json({ status: "failure", message: createInvoice1.msg });
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
