import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { logIn, getUser, createTpos, addUserWallet, createUser, createBlotzAutoReverseSwap, userLogIn, splitPaymentTarget, lnurlpCreate, withdrawLinkCreate } from "./lnbit";



export const addLnbit = async (email: any, usersCollection: any, onchain_address: any, type: any = 1, accountType: any = 1, attempt: any = 1) => {
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
                let getUserToken = await userLogIn(accountType, addUser?.data?.id) as any;
                getUserToken = getUserToken?.data?.token;
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
                    }, getUserToken, accountType) as any;

                    if (addTpsoLink && addTpsoLink?.status) {
                        let link = addTpsoLink?.data?.id;


                        const walletId = getUserData?.data?.wallets[0]?.id;
                        const userId = getUserData?.data?.id;

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
                        }, getUserToken, accountType) as any;

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
                            return;
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }

                } else {
                    return;
                }
            } else {
                return;
            }
        } else {
            if (attempt < 3) {
                let dt = await addLnbit(email, usersCollection, onchain_address, type, accountType, (attempt + 1))
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
        let setting = {
            "asset": "L-BTC/BTC",
            "direction": "send",
            "balance": 100,
            "instant_settlement": true,
            "amount": "200",
        }
        let boltzReverseSwap1 = await createBlotzAutoReverseSwap({
            "wallet": wallet1,
            "onchain_address": coinosis_address,
            "refund_address": refund_address,
            ...setting
        }, apiKey1, token, accountType) as any;
        if (boltzReverseSwap1 && boltzReverseSwap1?.status) {
            result.boltzAutoReverseSwap1 = boltzReverseSwap1?.data;
        }
        let boltzReverseSwap2 = await createBlotzAutoReverseSwap({
            "wallet": wallet2,
            "onchain_address": bitcoin_address,
            "refund_address": refund_address,
            ...setting
        }, apikey2, token, accountType) as any;
        if (boltzReverseSwap2 && boltzReverseSwap2?.status) {
            result.boltzAutoReverseSwap2 = boltzReverseSwap2?.data;
        }
        return result
    } catch (error) {
        console.log("error on create Tpos Link", error)
    }
}




//create Lnurp Pay Links:
const createLnurlpLink = async (apiKey1: any, token: any, accountType: any) => {
    try {
        let result = {
            status: true,
            createLnurlpLink1: {},
        }
        let setting = {
            "description": "send",
            "min": 10,
            "max": 100000000,
            "currency": "sats",
        }
        let createLnurlpLink1 = await lnurlpCreate(setting, apiKey1, token, accountType) as any;
        if (createLnurlpLink1 && createLnurlpLink1?.status) {
            result.createLnurlpLink1 = createLnurlpLink1?.data;
        }
        return result
    } catch (error) {
        console.log("error on create Tpos Link", error)
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
        }
        let createWithdrawLink1 = await withdrawLinkCreate(setting, apiKey1, token, accountType) as any;
        if (createWithdrawLink1 && createWithdrawLink1?.status) {
            result.createWithdrawLink1 = createWithdrawLink1?.data;
        }
        return result
    } catch (error) {
        console.log("error on create Tpos Link", error)
    }
}




const createSplitPayment = async (apiKey1: any, apikey2: any, token: any, accountType: any) => {
    try {
        let result = {
            status: true,
            splitPaymentTarget1: {},
            splitPaymentTarget2: {}
        }
        let setting = {
            "targets": [
                {
                    "wallet": "ccd505c23ebf4a988b190e6aaefff7a5",
                    "alias": "commision",
                    "percent": 0.5
                }
            ]
        }
        let splitPaymentTarget1 = await splitPaymentTarget(setting, apiKey1, token, accountType) as any;
        if (splitPaymentTarget1 && splitPaymentTarget1?.status) {
            result.splitPaymentTarget1 = splitPaymentTarget1?.data;
        }
        let splitPaymentTarget2 = await splitPaymentTarget(setting, apikey2, token, accountType) as any;
        if (splitPaymentTarget2 && splitPaymentTarget2?.status) {
            result.splitPaymentTarget2 = splitPaymentTarget2?.data;
        }
        return result
    } catch (error) {
        console.log("error on create Tpos Link", error)
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

            if (addUser && addUser?.status) {

                //Get User Wallet Token
                let getUserToken = await userLogIn(accountType, addUser?.data?.id) as any;
                getUserToken = getUserToken?.data?.token;

                let addNewWallet = await addUserWallet(addUser?.data?.id, {
                    name: "bitcoin",
                    currency: "USD"
                }, token, accountType) as any;
                if (addNewWallet && !addNewWallet?.status) {
                    return;
                }

                // get User Info
                let getUserData = await getUser(addUser?.data?.id, token, accountType) as any;

                if (getUserData && getUserData?.status) {

                    //create Tpos Link:
                    let addTpsoLink = await createTposLink(getUserData?.data?.wallets[0]?.id, getUserData?.data?.wallets[1]?.id, getUserData?.data?.wallets[0]?.adminkey, getUserData?.data?.wallets[1]?.adminkey, getUserToken, accountType) as any;
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
                            return;
                        } else {
                            return;
                        }
                    }

                    let setSplitPaymentTarget = await createSplitPayment(adminKey, adminKey2, getUserToken, accountType);

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
        console.log("error-->", error);
        return;
    }
}




export const addLnbitSpendUser = async (madhouseWallet: any, email: any, usersCollection: any, accountType: any = 1, attempt: any = 1) => {
    try {
        const newEmail = email;
        let refund_address = ""
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
                    "splitpayments",
                    "withdraw"
                ]
            }, token, accountType) as any;

            console.log("addUser spend wallet line 462-->", addUser)

            if (addUser && addUser?.status) {

                //Get User Wallet Token
                let getUserToken = await userLogIn(accountType, addUser?.data?.id) as any;
                getUserToken = getUserToken?.data?.token;


                // get User Info
                let getUserData = await getUser(addUser?.data?.id, token, accountType) as any;

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

                    let addLnurlpLink = await createLnurlpLink(adminKey, getUserToken, accountType);

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

