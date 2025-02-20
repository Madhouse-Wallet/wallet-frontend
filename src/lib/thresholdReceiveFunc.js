import { initializeTBTC } from "./tbtcSdkInitializer";

export const initializetbtc = async (provider) => {
    try {
        const tbtcSdk = await initializeTBTC(provider.signer);
        console.log("tbtcSdk -->", tbtcSdk);
        if (tbtcSdk) {
            const bitcoinRecoveryAddress = "tb1qfpu7q7326kp7ydfjuez0x0k5834dnv8npx553w"; // Replace with a valid BTC address
            console.log("bitcoinRecoveryAddress00>", bitcoinRecoveryAddress);
            try {
                console.log(tbtcSdk.deposits.initiateDeposit);
                const deposit = await tbtcSdk.deposits.initiateDeposit(
                    bitcoinRecoveryAddress
                );
                console.log("Deposit initiated:", deposit);
                const bitcoinDepositAddress = await deposit.getBitcoinAddress();
                console.log("Bitcoin deposit address:", bitcoinDepositAddress);
                return {
                    status: true,
                    address: bitcoinDepositAddress,
                    sdk: tbtcSdk,
                    depo: deposit
                }
            } catch (error) {
                console.error("Error during deposit process:", error);
                return {
                    status: false,
                    msg: error.message
                }
            }
        } else {
            return {
                status: false,
                msg: "TBTC Initialize Error!"
            }
        }
    } catch (error) {
        console.log("initializetbtc error", error)
        return {
            status: false,
            msg: error.message
        }
    }
}


export const mint = async (depo) => {
    try {
        const fundingUTXOs = await depo.detectFunding();
        console.log("fundingUTXOs---->", fundingUTXOs);
        if (fundingUTXOs.length > 0) {
            const txHash = await depo.initiateMinting(fundingUTXOs[0]);
            console.log("txHash---->", txHash);
            return {
                status: true,
                msg: "Deposit Found!",
                check: false
            }
        } else {
            console.log("depo-->", depo);
            return {
                status: false,
                msg: "No Deposit Found!",
                check: true
            }
        }
    } catch (error) {
        console.log("initializetbtc error", error)
        return {
            status: false,
            msg: error.message
        }
    }
}