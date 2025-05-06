import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, createSwapReverse, payInvoice, createUser, createBlotzAutoReverseSwap } from "./lnbit";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { amount, onchain_address } = req.body;
        const getToken = await logIn(2) as any;
        let token = getToken?.data?.token;
        let data = await createSwapReverse({
            "asset": "L-BTC/BTC",
            "direction": "send",
            "balance": 100,
            "instant_settlement": true,
            "wallet": "a1cd9f71c5f64ac289b4d21607a8ec92",
            "amount": amount,
            "onchain_address": onchain_address
        }, token, 2) as any;
        console.log("data-->", data)
        if (data?.status) {
            const payInv = await payInvoice({
                "out": true,
                "bolt11": data?.data?.invoice // ← invoice from above
            }, token, 2) as any
            if (payInv?.status) {
                console.log("done payment!")
                return res.status(200).json({ status: "success", message: 'Done Payment!', userData: {} });
            } else {
                return res.status(400).json({ status: "failure", message: data.msg  });
            }
        } else {
            return res.status(400).json({ status: "failure", message: data.msg  });
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
