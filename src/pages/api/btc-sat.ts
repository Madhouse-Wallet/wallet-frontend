import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, createSwapReverse, createSwap, createInvoice, payInvoice, createUser, createBlotzAutoReverseSwap } from "./lnbit";




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }


    try {
        const { amount, refund_address } = req.body;
        const getToken = await logIn(2) as any;
        let token = getToken?.data?.token;
        const satoshiAmount = amount * 100000000;
        let data = await createSwap({
            "wallet": "ccd505c23ebf4a988b190e6aaefff7a5",
            "asset": "BTC/BTC",
            "refund_address": refund_address,
            "amount": satoshiAmount,
            "direction": "receive",
            "feerate": true,
            "feerate_value": 0
        }, token, 2) as any;
        // console.log("data-->", data)
        if (data?.status) {
            return res.status(200).json({ status: "success", message: 'Swap Address Generated!', data: data?.data });
        } else {
            return res.status(400).json({ status: "failure", message: data.msg });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


// try {





//     const { amount, publicKey } = req.body;
//     const getToken = await logIn(2) as any;
//     let token = getToken?.data?.token;
//     console.log("token-->", token)
//     const satoshiAmount = amount * 100000000;
//     let createInvoice1 = await createInvoice({
//         "out": false,
//         "unit": "sat",
//         "amount": satoshiAmount,
//         "memo": "invoice",
//     }, token, 2) as any;
//     // console.log("createInvoice1", createInvoice1?.data?.bolt11)
//     if (createInvoice1?.status) {
//         // return res.status(400).json({ status: "failure", message: "" });

//         let data = await createReverseSwap(createInvoice1?.data?.bolt11, publicKey)
//         console.log("data", data)
//         if (data?.status == "success") {
//             return res.status(200).json({ status: "success", message: 'Done Payment!', data });
//         } else {
//             return res.status(400).json({ status: "failure", message: data.error });
//         }
//     } else {
//         return res.status(400).json({ status: "failure", message: createInvoice1.msg });
//     }

// } catch (error) {
//     console.error('Error adding user:', error);
//     return res.status(500).json({ error: 'Internal server error' });
// }
// }

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '3mb',
        },
    },
};