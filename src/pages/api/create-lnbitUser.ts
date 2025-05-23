import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, getUser, createTpos, addUserWallet, createUser, createBlotzAutoReverseSwap, userLogIn, splitPaymentTarget, lnurlpCreate, withdrawLinkCreate } from "./lnbit";

import { updateWithdrawLinkByWallet } from "./updateWithdrawLink";



//create Tpos Links:
const createTposLink = async (wallet1: any, wallet2: any, apiKey1: any, apikey2: any, token: any, accountType: any) => {
    try {
        let result = {
            tpos1: {},
            tpos2: {},
            status: true
        }
        let setting = {
            "currency": "sats",
            "tax_inclusive": true,
            "tax_default": 0,
            "tip_options": "[]",
            "tip_wallet": "",
            "withdraw_time": 0,
            "withdraw_between": 10,
            "withdraw_time_option": "",
            "withdraw_premium": 0,
            "withdraw_pin_disabled": false,
            "lnaddress": true,
            "lnaddress_cut": 1
        }
        let createTpos1 = await createTpos({
            "wallet": wallet1,
            "name": "usdc",
            ...setting
        }, apiKey1, token, accountType) as any;
        if (createTpos1 && createTpos1?.status) {
            result.tpos1 = createTpos1?.data;
        }
        let createTpos2 = await createTpos({
            "wallet": wallet2,
            "name": "bitcoin",
            ...setting
        }, apikey2, token, accountType) as any;
        if (createTpos2 && createTpos2?.status) {
            result.tpos2 = createTpos2?.data;
        }
        return result
    } catch (error) {
        console.log("error on create Tpos Link", error)
    }
}





//create boltz reverse auto-swap Links:
const createBoltzAutoReverseSwap = async (wallet1: any, wallet2: any, apiKey1: any, apikey2: any, coinosis_address: any, bitcoin_address: any, refund_address: any, token: any, accountType: any) => {
    try {
        let result = {
            status: true,
            boltzAutoReverseSwap1: {},
            boltzAutoReverseSwap2: {}
        }
        let boltzReverseSwap1 = await createBlotzAutoReverseSwap({
            "wallet": wallet1,
            "onchain_address": coinosis_address,
            "asset": "L-BTC/BTC",
            "direction": "send",
            "balance": 100,
            "instant_settlement": true,
            "amount": "200",
        }, apiKey1, token, 1) as any;
        if (boltzReverseSwap1 && boltzReverseSwap1?.status) {
            result.boltzAutoReverseSwap1 = boltzReverseSwap1?.data;
        }
        let boltzReverseSwap2 = await createBlotzAutoReverseSwap({
            "wallet": wallet2,
            "onchain_address": bitcoin_address,
            "asset": "BTC/BTC",
            "direction": "send",
            "balance": 100,
            "instant_settlement": true,
            "amount": "25000",
        }, apikey2, token, 2) as any;
        if (boltzReverseSwap2 && boltzReverseSwap2?.status) {
            result.boltzAutoReverseSwap2 = boltzReverseSwap2?.data;
        }
        return result
    } catch (error) {
        console.log("error on createBoltzAutoReverseSwap", error)
    }
}




//create Lnurp Pay Links:
const createLnurlpLink = async (wallet: any, apiKey1: any, token: any, accountType: any) => {
    try {
        let result = {
            status: true,
            createLnurlpLink1: {},
        }
        let setting = {
            "description": "send",
            "min": 10,
            "max": 10000000,
            "currency": "sats",
            "wallet": wallet
        }
        let createLnurlpLink1 = await lnurlpCreate(setting, apiKey1, token, accountType) as any;
        console.log("createLnurlpLink1-->", createLnurlpLink1)
        if (createLnurlpLink1 && createLnurlpLink1?.status) {
            result.createLnurlpLink1 = createLnurlpLink1?.data;
        }
        return result
    } catch (error) {
        console.log("error on createLnurlpLink1 Link", error)
    }
}




//create withdraw  Links:
const createWithdrawLink = async (apiKey1: any, token: any, accountType: any) => {
    try {
        let result = {
            status: true,
            createWithdrawLink1: {},
        }
        let setting = {
            "title": "withdraw",
            "min_withdrawable": 10,
            "max_withdrawable": 100000000,
            "uses": 1,
            "wait_time": 1,
            "is_unique": true,
            "webhook_url": "",
            "webhook_headers": "",
            "webhook_body": "",
            "custom_url": ""
        }
        let createWithdrawLink1 = await withdrawLinkCreate(setting, apiKey1, token, accountType) as any;
        console.log("createWithdrawLink-->", createWithdrawLink1)
        if (createWithdrawLink1 && createWithdrawLink1?.status) {
            result.createWithdrawLink1 = createWithdrawLink1?.data;
        }
        return result
    } catch (error) {
        console.log("error on createWithdrawLink ", error)
    }
}




const createSplitPayment = async (wallet1: any, wallet2: any, apiKey1: any, apikey2: any, token: any, accountType: any) => {
    try {
        let result = {
            status: true,
            splitPaymentTarget1: {},
            splitPaymentTarget2: {}
        }

        let splitPaymentTarget1 = await splitPaymentTarget({
            "targets": [
                {
                    "wallet": process.env.NEXT_PUBLIC_SPLIT_PAYMENT_ADDRESS,
                    "alias": "commision",
                    "percent": process.env.NEXT_PUBLIC_SPLIT_PAYMENT_PERCENTAGE,
                    "source": {
                        "id": wallet1,
                        "adminkey": apiKey1
                    }
                }
            ]
        }, apiKey1, token, accountType) as any;
        console.log("splitPaymentTarget1 -->", splitPaymentTarget1)
        if (splitPaymentTarget1 && splitPaymentTarget1?.status) {
            result.splitPaymentTarget1 = splitPaymentTarget1?.data;
        }
        let splitPaymentTarget2 = await splitPaymentTarget({
            "targets": [
                {
                    "wallet": process.env.NEXT_PUBLIC_SPLIT_PAYMENT_ADDRESS,
                    "alias": "commision",
                    "percent": process.env.NEXT_PUBLIC_SPLIT_PAYMENT_PERCENTAGE,
                    "source": {
                        "id": wallet2,
                        "adminkey": apikey2
                    }
                }
            ]
        }, apikey2, token, accountType) as any;
        console.log("splitPaymentTarget2 -->", splitPaymentTarget2)
        if (splitPaymentTarget2 && splitPaymentTarget2?.status) {
            result.splitPaymentTarget2 = splitPaymentTarget2?.data;
        }
        return result
    } catch (error) {
        console.log("error on createSplitPayment", error)
    }
}


export const addLnbitTposUser = async (madhouseWallet: any, email: any, usersCollection: any, coinosis_address: any, bitcoin_address: any, refund_address: any, accountType: any = 1, attempt: any = 1) => {
    try {
        const newEmail = email;

        //admin login
        let getToken = await logIn(accountType) as any;
        if (getToken && getToken?.status) {
            let token = getToken?.data?.token;

            // create lnbit user with extensions:
            let addUser = await createUser({
                "email": newEmail,
                "username": madhouseWallet,
                "extensions": [
                    "tpos",
                    "boltz",
                    "lndhub",
                    "lnurlp",
                    "splitpayments"
                ]
            }, token, accountType) as any;
            console.log("addUser tpos wallet line 345-->", addUser)
            if (addUser && addUser?.status) {
                //Get User Wallet Token
                let getUserToken = await userLogIn(accountType, addUser?.data?.id) as any;
                getUserToken = getUserToken?.data?.token;
                console.log("getUserToken tpos wallet line 351-->", getUserToken)
                let addNewWallet = await addUserWallet(addUser?.data?.id, {
                    name: "bitcoin",
                    currency: "USD"
                }, token, accountType) as any;
                if (addNewWallet && !addNewWallet?.status) {
                    return;
                }
                console.log("addNewWallet tpos wallet line 359-->", addNewWallet)

                // get User Info
                let getUserData = await getUser(addUser?.data?.id, token, accountType) as any;
                console.log("getUserData tpos wallet line 359-->", getUserData)
                if (getUserData && getUserData?.status) {
                    //create Tpos Link:
                    let addTpsoLink = await createTposLink(getUserData?.data?.wallets[0]?.id, getUserData?.data?.wallets[1]?.id, getUserData?.data?.wallets[0]?.adminkey, getUserData?.data?.wallets[1]?.adminkey, getUserToken, accountType) as any;

                    console.log("addTpsoLink tpos wallet line 367-->", addTpsoLink)

                    // 1st wallet vars
                    let link = addTpsoLink?.tpos1?.id;
                    const walletId = getUserData?.data?.wallets[0]?.id;
                    const userId = getUserData?.data?.id;
                    const adminKey = getUserData?.data?.wallets[0]?.adminkey;

                    // 2nd wallet vars
                    let link2 = addTpsoLink?.tpos2?.id;
                    const walletId2 = getUserData?.data?.wallets[1]?.id;
                    const userId2 = getUserData?.data?.id;
                    const adminKey2 = getUserData?.data?.wallets[1]?.adminkey;

                    if (addTpsoLink && addTpsoLink?.status) {
                        const updateFields = {
                            lnbitEmail: newEmail,
                            lnbitLinkId: link,
                            lnbitWalletId: walletId,
                            lnbitId: userId,
                            lnbitAdminKey: adminKey,
                            [`lnbitEmail_2`]: newEmail,
                            [`lnbitLinkId_2`]: link2,
                            [`lnbitWalletId_2`]: walletId2,
                            [`lnbitId_2`]: userId2,
                            [`lnbitAdminKey_2`]: adminKey2,
                        }
                        const result = await usersCollection.findOneAndUpdate(
                            { email },
                            { $set: updateFields },
                            { returnDocument: "after" }
                        );
                    }

                    if (accountType == 1) {
                        let addcreateBlotzAutoReverseSwap = await createBoltzAutoReverseSwap(walletId, walletId2, adminKey, adminKey2, coinosis_address, bitcoin_address, refund_address, getUserToken, accountType);
                        console.log("addcreateBlotzAutoReverseSwap tpos wallet line 403-->", addcreateBlotzAutoReverseSwap)

                        if (addcreateBlotzAutoReverseSwap && addcreateBlotzAutoReverseSwap?.status) {


                            const updateFields = {
                                boltzAutoReverseSwap: addcreateBlotzAutoReverseSwap?.boltzAutoReverseSwap1 || {},
                                boltzAutoReverseSwap_2: addcreateBlotzAutoReverseSwap?.boltzAutoReverseSwap2 || {}
                            };
                            const result = await usersCollection.findOneAndUpdate(
                                { email: email }, // filter
                                {
                                    $set: updateFields
                                }, // update
                                { returnDocument: "after" } // return updated document
                            );
                        }
                    }

                    let setSplitPaymentTarget = await createSplitPayment(walletId, walletId2, adminKey, adminKey2, getUserToken, accountType);
                    console.log("setSplitPaymentTarget-->", setSplitPaymentTarget)
                    return;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else {
            if (attempt < 3) {
                // let dt = await addLnbit(email, usersCollection, onchain_address, type, accountType, (attempt + 1))
                return;
            } else {
                return;
            }
        }
    } catch (error) {
        console.log("error addLnbitTposUser-->", error);
        return;
    }
}




export const addLnbitSpendUser = async (madhouseWallet: any, email: any, usersCollection: any, accountType: any = 1, attempt: any = 1) => {
    try {
        const newEmail = email;
        let refund_address = ""
        //admin login
        let getToken = await logIn(accountType) as any;
        console.log("getToken spend wallet line 445-->", getToken)

        if (getToken && getToken?.status) {
            let token = getToken?.data?.token;

            // create lnbit user with extensions:
            let addUser = await createUser({
                "email": newEmail,
                "username": madhouseWallet,
                "extensions": [
                    "tpos",
                    "boltz",
                    "lndhub",
                    "lnurlp",
                    "splitpayments",
                    "withdraw"
                ]
            }, token, accountType) as any;

            console.log("addUser spend wallet line 462-->", addUser)

            if (addUser && addUser?.status) {

                //Get User Wallet Token
                let getUserToken = await userLogIn(accountType, addUser?.data?.id) as any;
                getUserToken = getUserToken?.data?.token;

                console.log("getUserToken spend wallet line 470-->", getUserToken)

                // get User Info
                let getUserData = await getUser(addUser?.data?.id, token, accountType) as any;

                console.log("getUserData spend wallet line 477-->", getUserData)

                if (getUserData && getUserData?.status) {
                    const walletId = getUserData?.data?.wallets[0]?.id;
                    refund_address = walletId;
                    const userId = getUserData?.data?.id;
                    const adminKey = getUserData?.data?.wallets[0]?.adminkey;
                    const updateFields = {
                        [`lnbitEmail_3`]: newEmail,
                        [`lnbitWalletId_3`]: walletId,
                        [`lnbitId_3`]: userId,
                        [`lnbitAdminKey_3`]: adminKey,
                    }
                    const result = await usersCollection.findOneAndUpdate(
                        { email },
                        { $set: updateFields },
                        { returnDocument: "after" }
                    );

                    let addLnurlpLink = await createLnurlpLink(walletId, adminKey, getUserToken, accountType);

                    console.log("addLnurlpLink spend wallet line 498-->", addLnurlpLink)


                    if (addLnurlpLink && addLnurlpLink?.status) {

                        const updateFields = {
                            spendLnurlpLink: addLnurlpLink?.createLnurlpLink1 || {},
                        };
                        const result = await usersCollection.findOneAndUpdate(
                            { email: email }, // filter
                            {
                                $set: updateFields
                            }, // update
                            { returnDocument: "after" } // return updated document
                        );
                    }

                    let addWithdrawLink = await createWithdrawLink(adminKey, getUserToken, accountType);
                    console.log("addWithdrawLink spend wallet line 498-->", addWithdrawLink)

                    if (addWithdrawLink && addWithdrawLink?.status) {

                        const updateFields = {
                            spendWithdrawLink: addWithdrawLink?.createWithdrawLink1 || {},
                        };
                        const result = await usersCollection.findOneAndUpdate(
                            { email: email }, // filter
                            {
                                $set: updateFields
                            }, // update
                            { returnDocument: "after" } // return updated document
                        );
                    }

                    updateWithdrawLinkByWallet(walletId, {
                        "uses": 100000000
                    }) as any;

                    return refund_address;

                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            if (attempt < 3) {
                // let dt = await addLnbit(email, usersCollection, onchain_address, type, accountType, (attempt + 1))
                return;
            } else {
                return;
            }
        }
    } catch (error) {
        console.log("error-->", error);
        return;
    }
}

