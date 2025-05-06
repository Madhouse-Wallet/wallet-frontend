import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, createSwapReverse, createInvoice, payInvoice, createUser, createBlotzAutoReverseSwap } from "./lnbit";


const createReverseSwap = async (invoice: any) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/swap/reverseSwap`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ invoice }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                status: "error",
                error: data.error || "Failed to create swap",
            };
        }

        return {
            status: "success",
            data: data.data,
        };
    } catch (error: any) {
        console.log("error-->",error)
        return {
            status: "error",
            error: error.message || "Something went wrong",
        };
    }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { amount } = req.body;
        const getToken = await logIn(2) as any;
        let token = getToken?.data?.token;
        console.log("token-->",token)
        const satoshiAmount = amount * 100000000;
        let createInvoice1 = await createInvoice({
            "out": false,
            "unit": "sat",
            "amount": satoshiAmount,
            "memo": "invoice",
        }, token, 2) as any;
        console.log("createInvoice1", createInvoice1?.data?.bolt11)
        if (createInvoice1?.status) {
            let data = await createReverseSwap(createInvoice1?.data?.bolt11)
            console.log("data", data)
            if (data?.status == "success") {
                return res.status(200).json({ status: "success", message: 'Done Payment!', data });
            } else {
                return res.status(400).json({ status: "failure", message: data.error });
            }
        }else{
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
