import type { NextApiRequest, NextApiResponse } from 'next';
import { logIn, payInvoice } from "./lnbit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {

        const { invoice } = req.body;
        const getToken = await logIn(2) as any;
        // console.log("data-->", data)
        if (getToken?.status) {
            let token = getToken?.data?.token;
            const payInv = await payInvoice({
                "out": true,
                "bolt11": invoice // ← invoice from above
            }, token, 2) as any
            if (payInv?.status) {
                console.log("done payment!")
                return res.status(200).json({ status: "success", message: 'Done Payment!', userData: {} });
            } else {
                return res.status(400).json({ status: "failure", message: payInv.msg });
            }
        } else {
            return res.status(400).json({ status: "failure", message: getToken.msg });
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
