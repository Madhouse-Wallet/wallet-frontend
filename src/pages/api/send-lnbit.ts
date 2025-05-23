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
        const satoshiAmount = amount * 100000000;
        let data = await createSwapReverse({
            "wallet": "ccd505c23ebf4a988b190e6aaefff7a5",
            "asset": "BTC/BTC",
            "amount": satoshiAmount,
            "direction": "send",
            "instant_settlement": true,
            "onchain_address": onchain_address,
            "feerate": true,
            "feerate_value": 0
        }, token, 2) as any;
        console.log("createSwapReverse data-->", data)
        if (data?.status) {
            const payInv = await payInvoice({
                "out": true,
                "bolt11": data?.data?.invoice // ← invoice from above
            }, token, 2,"") as any
            console.log("payInv data-->", payInv)
            if (payInv?.status) {
                console.log("done payment!")
                return res.status(200).json({ status: "success", message: 'Withdraw Done!', data: payInv?.data });
            } else {
                return res.status(400).json({ status: "failure", message: data.msg });
            }
        } else {
            return res.status(400).json({ status: "failure", message: data.msg });
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