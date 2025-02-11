import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { findData = {}, updtData = {} } = req.body;
        // Connect to the database
        const db = (await client.connect()).db(); // Defaults to the database in the connection string
        const usersCollection = db.collection('users'); // Use 'users' collection
        // const existingUser = await usersCollection.findOne({ email });
        const existingUser = await usersCollection.findOneAndUpdate(findData, updtData, { returnDocument: "after" });

        if (existingUser) {
            //   return res.status(400).json({ error: 'Email already exists' });
            return res.status(200).json({ status: "success", message: 'User fetched successfully', userId: existingUser });
        } else {
            return res.status(400).json({ status: "failure", message: 'No User Found!' });
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
