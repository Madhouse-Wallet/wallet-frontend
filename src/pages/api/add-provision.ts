import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { addLnbitTposUser, addLnbitSpendUser } from "./create-lnbitUser";


// create user on lnbit
function shortenAddress(address: any) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}${address.slice(-4)}`;
}
const addLnbitCall = async (madhouseWallet: any, email: any, usersCollection: any, liquidBitcoinWallet: any, bitcoinWallet: any, provisionlnbitType: any, refund_address1: any) => {
    try {
        const shortened = await shortenAddress(madhouseWallet);
        if(provisionlnbitType == 1){
            let refund_address = await addLnbitSpendUser(shortened, email, usersCollection, 2, 1);
            if(refund_address){
                await addLnbitTposUser(shortened, email, usersCollection, liquidBitcoinWallet, bitcoinWallet, refund_address, 1, 1);
            }
        }else if (provisionlnbitType == 2){
            await addLnbitTposUser(shortened, email, usersCollection, liquidBitcoinWallet, bitcoinWallet, refund_address1, 1, 1);
        }else if (provisionlnbitType == 3){
            await addLnbitTposUser(shortened, email, usersCollection, liquidBitcoinWallet, bitcoinWallet, refund_address1, 1, 1);
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
        const { email  } = req.body;

        // Validate email
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Invalid email' });
        }

        // Connect to the database
        const db = (await client.connect()).db(); // Defaults to the database in the connection string
        const usersCollection = db.collection('users'); // Use 'users' collection

        // Check if the email already exists
        const existingUser = await usersCollection.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
         if(existingUser){
            console.log("existingUser-->",existingUser)
            if(!existingUser?.lnbitWalletId_3){
                console.log("3",existingUser?.lnbitWalletId_3)
                addLnbitCall(existingUser?.wallet, email, usersCollection, existingUser?.liquidBitcoinWallet, existingUser?.bitcoinWallet, 1, "")
            }else if(!existingUser?.lnbitId){
                console.log("2",existingUser?.lnbitId)

                addLnbitCall(existingUser?.wallet, email, usersCollection, existingUser?.liquidBitcoinWallet, existingUser?.bitcoinWallet, 2, existingUser?.lnbitWalletId_3)
            }else if(!existingUser?.lnbitId_2){
                console.log("1",existingUser?.lnbitId_2)

                addLnbitCall(existingUser?.wallet, email, usersCollection, existingUser?.liquidBitcoinWallet, existingUser?.bitcoinWallet, 3, existingUser?.lnbitWalletId_3)
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
