import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { createPass, deletePass } from "./passninjaCard";


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

        // Connect to the database
        const db = (await client.connect()).db(); // Defaults to the database in the connection string
        const usersCollection = db.collection('users'); // Use 'users' collection
        let existingUser = await usersCollection.findOne(
            { email: { $regex: new RegExp(`^${email}$`, 'i') } }
        );
        if (existingUser) {
            if (existingUser?.creditCardPass) {
                return res.status(400).json({ status: "failure", error: "Already Created!" });
            } else {
                let creditCardDetails = await createPass(existingUser?.wallet, type)
                if (creditCardDetails?.status) {
                    const existingUser = await usersCollection.findOneAndUpdate({ email }, {
                        $set: {
                            creditCardPass: creditCardDetails.data
                        },
                    }, { returnDocument: "after" });
                    return res.status(200).json({ status: "success", message: 'Card Created successfully!', data: existingUser });
                } else {
                    return res.status(400).json({ status: "failure", error: creditCardDetails?.msg });
                }
            }
        } else {
            return res.status(400).json({ status: "failure", error: "User Does Not Exist!" });
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
