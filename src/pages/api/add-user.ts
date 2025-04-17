import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, getUser, createTpos, createUser } from "./lnbit";

const addLnbit = async (email: any, usersCollection: any) => {
    try {
        const [username, domain] = email.split("@");
        const length = 4;
        const randomAlpha = await Array.from({ length }, () =>
            String.fromCharCode(97 + Math.floor(Math.random() * 26)) // a–z
        ).join("");
        const newEmail = `${username}madhouse${randomAlpha}@${domain}`;
        let returnData = {}
        let getToken = await logIn() as any;
        if (getToken && getToken?.status) {
            let token = getToken?.data?.token;
            let addUser = await createUser({
                "email": newEmail,
                "extensions": [
                    "tpos"
                ]
            }, token, process.env.NEXT_PUBLIC_LNBIT_API_KEY) as any;

            if (addUser && addUser?.status) {

                let getUserData = await getUser(addUser?.data?.id, token, process.env.NEXT_PUBLIC_LNBIT_API_KEY) as any;

                if (getUserData && getUserData?.status) {
                    let addTpsoLink = await createTpos({
                        "wallet": getUserData?.data?.wallets[0]?.id || getUserData?.data?.id,
                        "name": "",
                        "currency": "USD",
                        "tax_inclusive": true,
                        "tax_default": 0,
                        "tip_options": "[]",
                        "tip_wallet": "",
                        "withdraw_time": 0,
                        "withdraw_between": 10,
                        "withdraw_time_option": "",
                        "withdraw_premium": 0,
                        "withdraw_pin_disabled": false,
                        "lnaddress": false,
                        "lnaddress_cut": 0
                    }, token, process.env.NEXT_PUBLIC_LNBIT_API_KEY) as any;

                    if (addTpsoLink && addTpsoLink?.status) {
                        let link = addTpsoLink?.data?.id;
                        // console.log("test fd",{
                        //     lnbitEmail: newEmail,
                        //     lnbitLinkId: link,
                        //     lnbitWalletId: getUserData?.data?.wallets[0]?.id,
                        //     lnbitId: getUserData?.data?.id
                        // })
                        const result = await usersCollection.findOneAndUpdate(
                            { email: email }, // filter
                            {
                                $set: {
                                    lnbitEmail: newEmail,
                                    lnbitLinkId: link,
                                    lnbitWalletId: getUserData?.data?.wallets[0]?.id,
                                    lnbitId: getUserData?.data?.id
                                }
                            }, // update
                            { returnDocument: "after" } // return updated document
                        );
                        // console.log("result-->",result)
                    }
                }
            }
        }
    } catch (error) {
        console.log("error-->", error)
    }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, username, passkey, publickeyId, rawId, wallet } = req.body;

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
            //   return res.status(400).json({ error: 'Email already exists' });
            addLnbit(existingUser.email, usersCollection)
            return res.status(200).json({ status: "success", message: 'User fetched successfully', userData: existingUser });
        }

        // Insert the new user
        const result = await usersCollection.insertOne({
            email, username, passkey_number: 1, passkey_status: false, passkey, publickeyId, rawId, wallet, multisigAddress: "", passkey2: "", passkey3: "", multisigSetup: false, multisigActivate: false, ensName: "",
            ensSetup: false, createdAt: new Date()
        });
        // console.log("result-->", result)
        addLnbit(email, usersCollection)
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
