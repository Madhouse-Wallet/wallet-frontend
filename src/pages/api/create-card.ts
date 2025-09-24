import type { NextApiRequest, NextApiResponse } from 'next';
//import { createPass, deletePass } from "./passninjaCard";
import { lambdaInvokeFunction } from "../../lib/apiCall";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, type = "apple" } = req.body;
        // Validate email
        // Validate email
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Invalid email' });
        }


        const apiResponse = await lambdaInvokeFunction({ email }, "madhouse-backend-production-getUser") as any;
        // if (apiResponse?.status == "success") {
        //     let existingUser = apiResponse?.data;
        //     if (existingUser) {
        //         if (existingUser?.creditCardPass) {
        //             return res.status(400).json({ status: "failure", error: "Already Created!" });
        //         } else {
        //             let creditCardDetails = await createPass(existingUser?.wallet, type)
        //             if (creditCardDetails?.status) {
        //                 const existingUser = await lambdaInvokeFunction({
        //                     findData: { email }, updtData: {
        //                         $set: {
        //                             creditCardPass: creditCardDetails.data
        //                         }
        //                     }
        //                 }, "madhouse-backend-production-updtUser") as any;
        //                 if (existingUser?.status == "success") {
        //                     return res.status(200).json({ status: "success", message: 'Card Created successfully!', data: existingUser?.data });
        //                 } else {
        //                     return res.status(400).json({ status: "failure", message: existingUser?.message, error: existingUser?.error });
        //                 }
        //             } else {
        //                 return res.status(400).json({ status: "failure", error: creditCardDetails?.msg });
        //             }
        //         }
        //     } else {
        //         return res.status(400).json({ status: "failure", error: "User Does Not Exist!" });
        //     }
        // } else {
        //     return res.status(400).json({ status: "failure", message: apiResponse?.message, error: apiResponse?.error });
        // }
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
