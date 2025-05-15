import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, getUser, createTpos, createUser, createBlotzAutoReverseSwap } from "./lnbit";

const addLnbit = async (email: any, usersCollection: any, onchain_address: any, type: any = 1, accountType: any = 1) => {
    try {
        const [username, domain] = email.split("@");
        const length = 4;
        const randomAlpha = await Array.from({ length }, () =>
            String.fromCharCode(97 + Math.floor(Math.random() * 26)) // a–z
        ).join("");
        const newEmail = `${username}${type}madhouse${randomAlpha}@${domain}`;
        let returnData = {}
        let getToken = await logIn(accountType) as any;
        if (getToken && getToken?.status) {
            let token = getToken?.data?.token;
            let addUser = await createUser({
                "email": newEmail,
                "extensions": [
                    "tpos",
                    "boltz",
                    "lndhub",
                    "lnurlp",
                    "withdraw"
                ]
            }, token, accountType) as any;

            if (addUser && addUser?.status) {

                let getUserData = await getUser(addUser?.data?.id, token, accountType) as any;
                // console.log("getUserData-->", getUserData, getUserData?.data?.wallets)
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
                    }, token, accountType) as any;

                    if (addTpsoLink && addTpsoLink?.status) {
                        let link = addTpsoLink?.data?.id;
                        // console.log("test fd", {
                        //     lnbitEmail: newEmail,
                        //     lnbitLinkId: link,
                        //     lnbitWalletId: getUserData?.data?.wallets[0]?.id,
                        //     lnbitId: getUserData?.data?.id
                        // })

                        const walletId = getUserData?.data?.wallets[0]?.id;
                        const userId = getUserData?.data?.id;
                        // console.log("type- t->", type);
                        const updateFields =
                            type > 1
                                ? {
                                    [`lnbitEmail_${type}`]: newEmail,
                                    [`lnbitLinkId_${type}`]: link,
                                    [`lnbitWalletId_${type}`]: walletId,
                                    [`lnbitId_${type}`]: userId,
                                }
                                : {
                                    lnbitEmail: newEmail,
                                    lnbitLinkId: link,
                                    lnbitWalletId: walletId,
                                    lnbitId: userId,
                                };
                        const result = await usersCollection.findOneAndUpdate(
                            { email },
                            { $set: updateFields },
                            { returnDocument: "after" }
                        );
                        // console.log("result-->",result)
                    }

                    if (accountType == 1) {
                        let addcreateBlotzAutoReverseSwap = await createBlotzAutoReverseSwap({
                            "asset": "L-BTC/BTC",
                            "direction": "send",
                            "balance": 100,
                            "instant_settlement": true,
                            "wallet": getUserData?.data?.wallets[0]?.id || getUserData?.data?.id,
                            "amount": "200",
                            "onchain_address": onchain_address,
                            "refund_address": "ccd505c23ebf4a988b190e6aaefff7a5",
                        }, token, accountType) as any;

                        if (addcreateBlotzAutoReverseSwap && addcreateBlotzAutoReverseSwap?.status) {


                            const updateFields =
                                type > 1
                                    ? {
                                        [`boltzAutoReverseSwap_${type}`]: addcreateBlotzAutoReverseSwap?.data,
                                    }
                                    : {
                                        boltzAutoReverseSwap: addcreateBlotzAutoReverseSwap?.data
                                    };
                            const result = await usersCollection.findOneAndUpdate(
                                { email: email }, // filter
                                {
                                    $set: updateFields
                                }, // update
                                { returnDocument: "after" } // return updated document
                            );
                            // console.log("result-->",result)
                        }
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
        const { email, username, passkey, totalPasskey = 1, wallet, bitcoinWallet = "", liquidBitcoinWallet = "", coinosToken,
            flowTokens } = req.body;

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
            addLnbit(existingUser.email, usersCollection, liquidBitcoinWallet, 1, 1)
            addLnbit(existingUser.email, usersCollection, bitcoinWallet, 2, 1)
            addLnbit(existingUser.email, usersCollection, bitcoinWallet, 3, 2)
            return res.status(200).json({ status: "success", message: 'User fetched successfully', userData: existingUser });
        }
        // Insert the new user
        const result = await usersCollection.insertOne({
            email, username, passkey_number: 1, passkey_status: false, passkey, totalPasskey, wallet, bitcoinWallet, liquidBitcoinWallet,
            coinosToken, flowTokens, createdAt: new Date()
        });
        // console.log("result-->", result)
        addLnbit(email, usersCollection, liquidBitcoinWallet, 1, 1)
        addLnbit(email, usersCollection, bitcoinWallet, 2, 1)
        addLnbit(email, usersCollection, bitcoinWallet, 3, 2)
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