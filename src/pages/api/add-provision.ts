import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { addLnbitTposUser, addLnbitSpendUser } from "./create-lnbitUser";
import { addProvisionLambda } from "../../lib/apiCall"

 

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

        // Connect to the database
        const db = (await client.connect()).db(); // Defaults to the database in the connection string
        const usersCollection = db.collection('users'); // Use 'users' collection

        // Check if the email already exists
        const existingUser = await usersCollection.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (existingUser) {
            console.log("existingUser-->", existingUser)
            if (!existingUser?.lnbitWalletId_3) {
                console.log("3", existingUser?.lnbitWalletId_3)
                addProvisionLambda({
                    "madhouseWallet": existingUser?.wallet,
                    "email": email,
                    "liquidBitcoinWallet": existingUser?.liquidBitcoinWallet,
                    "bitcoinWallet": existingUser?.bitcoinWallet,
                    "provisionlnbitType": 1
                })

            } else if (!existingUser?.lnbitId) {
                console.log("2", existingUser?.lnbitId)
                addProvisionLambda({
                    "madhouseWallet": existingUser?.wallet,
                    "email": email,
                    "liquidBitcoinWallet": existingUser?.liquidBitcoinWallet,
                    "bitcoinWallet": existingUser?.bitcoinWallet,
                    "provisionlnbitType": 2,
                    "refund_address1": existingUser?.lnbitWalletId_3
                })
            } else if (!existingUser?.lnbitId_2) {
                console.log("1", existingUser?.lnbitId_2)
                addProvisionLambda({
                    "madhouseWallet": existingUser?.wallet,
                    "email": email,
                    "liquidBitcoinWallet": existingUser?.liquidBitcoinWallet,
                    "bitcoinWallet": existingUser?.bitcoinWallet,
                    "provisionlnbitType": 3,
                    "refund_address1": existingUser?.lnbitWalletId_3
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
