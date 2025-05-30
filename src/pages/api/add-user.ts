import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, getUser, createTpos, createUser, createBlotzAutoReverseSwap } from "./lnbit";
import { addLnbitTposUser, addLnbitSpendUser } from "./create-lnbitUser";
import { addProvisionLambda } from "../../lib/apiCall"

// create user on lnbit
function shortenAddress(address: any) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}${address.slice(-4)}`;
}
const addLnbitCall = async (madhouseWallet: any, email: any, usersCollection: any, liquidBitcoinWallet: any, bitcoinWallet: any) => {
    try {
        const shortened = await shortenAddress(madhouseWallet);
        let refund_address = await addLnbitSpendUser(shortened, email, usersCollection, 2, 1);
        if (refund_address) {
            await addLnbitTposUser(shortened, email, usersCollection, liquidBitcoinWallet, bitcoinWallet, refund_address, 1, 1);
        }
    } catch (error) {
        console.log("addLnbitCall error-->", error)
    }
}

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
            addLnbitCall(wallet, existingUser.email, usersCollection, liquidBitcoinWallet, bitcoinWallet)

            return res.status(200).json({ status: "success", message: 'User fetched successfully', userData: existingUser });
        }
        // Insert the new user
        const result = await usersCollection.insertOne({
            email, username, passkey_number: 1, passkey_status: false, passkey, totalPasskey, wallet, bitcoinWallet, liquidBitcoinWallet,
            coinosToken, flowTokens, coinosUserName, createdAt: new Date()
        });

        // create lnbit user on background
        // addLnbitCall(wallet, email, usersCollection, liquidBitcoinWallet, bitcoinWallet)
        addProvisionLambda({
            "madhouseWallet": wallet,
            "email": email,
            "liquidBitcoinWallet": bitcoinWallet,
            "bitcoinWallet": bitcoinWallet,
            "provisionlnbitType": 1
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
