import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, type = "", webAuthKey = "", ensName = "" } = req.body;
        // Connect to the database
        const db = (await client.connect()).db(); // Defaults to the database in the connection string
        const usersCollection = db.collection('users'); // Use 'users' collection
        if (type == "passkeyCheck") {

            // Check if the email already exists
            const existingUser = await usersCollection.findOne(
                {
                    email: { $regex: new RegExp(`^${email}$`, 'i') },
                    "passkey": { "$elemMatch": { "pubX": webAuthKey.pubX, "pubY": webAuthKey.pubY } }
                },
                { projection: { coinosToken: 0, flowTokens: 0, boltzAutoReverseSwap: 0, boltzAutoReverseSwap_2: 0 } }
            );
            if (existingUser) {
                //   return res.status(400).json({ error: 'Email already exists' });
                return res.status(200).json({ status: "success", message: 'User fetched successfully', userId: existingUser });
            } else {
                return res.status(400).json({ status: "failure", message: 'No User Found!' });
            }
        } if (type == "ens") {
            // Connect to the database
            const db = (await client.connect()).db(); // Defaults to the database in the connection string
            const usersCollection = db.collection('users'); // Use 'users' collection

            // Check if the email already exists
            const existingUser = await usersCollection.findOne(
                { ensName: { $regex: new RegExp(`^${ensName}$`, 'i') } },
                { projection: { coinosToken: 0, flowTokens: 0, boltzAutoReverseSwap: 0, boltzAutoReverseSwap_2: 0 } }
            );
            if (existingUser) {
                //   return res.status(400).json({ error: 'Email already exists' });
                return res.status(200).json({ status: "success", message: 'Ens Exist', userId: existingUser });
            } else {
                return res.status(400).json({ status: "failure", message: 'No User Found!' });
            }
        } else {
            // Validate email
            if (!email || typeof email !== 'string') {
                return res.status(400).json({ status: "failure", error: 'Invalid email' });
            }

            // Connect to the database
            const db = (await client.connect()).db(); // Defaults to the database in the connection string
            const usersCollection = db.collection('users'); // Use 'users' collection

            // Check if the email already exists
            const existingUser = await usersCollection.findOne(
                { email: { $regex: new RegExp(`^${email}$`, 'i') } },
                { projection: { coinosToken: 0, flowTokens: 0, boltzAutoReverseSwap: 0, boltzAutoReverseSwap_2: 0 } }
            );
            if (existingUser) {
                //   return res.status(400).json({ error: 'Email already exists' });
                return res.status(200).json({ status: "success", message: 'User fetched successfully', userId: existingUser });
            } else {
                return res.status(400).json({ status: "failure", message: 'No User Found!' });
            }
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
