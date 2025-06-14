import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, getUser, createTpos, createUser, createBlotzAutoReverseSwap } from "./lnbit";
import { addLnbitTposUser, addLnbitSpendUser } from "./create-lnbitUser";
import { addProvisionLambda } from "../../lib/apiCall"

 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, username, passkey, totalPasskey = 1, wallet, bitcoinWallet = "", liquidBitcoinWallet = "", coinosToken,
            flowTokens, coinosUserName } = req.body;

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

            // create lnbit user on background
            addProvisionLambda({
                "madhouseWallet": wallet,
                "email": existingUser.email,
                "liquidBitcoinWallet": liquidBitcoinWallet,
                "bitcoinWallet": bitcoinWallet,
                "provisionlnbitType": 1,
                "refund_address1" : ""
            })
            return res.status(200).json({ status: "success", message: 'User fetched successfully', userData: existingUser });
        }
        // Insert the new user
        const result = await usersCollection.insertOne({
            email, username, passkey_number: 1, passkey_status: false, passkey, totalPasskey, wallet, bitcoinWallet, liquidBitcoinWallet,
            coinosToken, flowTokens, coinosUserName, createdAt: new Date()
        });

        // create lnbit user on background
        addProvisionLambda({
            "madhouseWallet": wallet,
            "email": email,
            "liquidBitcoinWallet": liquidBitcoinWallet,
            "bitcoinWallet": bitcoinWallet,
            "provisionlnbitType": 1,
            "refund_address1" : ""
        })
        return res.status(201).json({ status: "success", message: 'User added successfully', userData: result });
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
