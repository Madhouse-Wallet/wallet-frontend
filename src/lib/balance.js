import { ethers } from "ethers";
import axios from "axios";

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getWalletNetWorth(walletAddress, providerUrl, etherscanApiKey) {
    console.log('Starting getWalletNetWorth function...');
    
    let provider;
    try {
        provider = new ethers.providers.JsonRpcProvider(providerUrl);
        await provider.getNetwork();
    } catch (error) {
        console.error('Provider connection failed:', error);
        throw new Error('Failed to connect to Ethereum provider');
    }
    
    try {
        let ethBalance;
        try {
            ethBalance = await provider.getBalance(walletAddress);
        } catch (error) {
            console.error('Failed to get ETH balance:', error);
            throw error;
        }
        
        const ethBalanceInEther = parseFloat(ethers.utils.formatEther(ethBalance));
        console.log('ETH balance:', ethBalanceInEther);
        
        let ethPrice = 0;
        try {
            const response = await axios.get(
                'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
                { timeout: 5000 }
            );
            ethPrice = response.data.ethereum.usd;
            console.log('ETH price:', ethPrice);
        } catch (error) {
            console.error('Failed to fetch ETH price:', error);
            throw error;
        }
        
        const ethValue = ethBalanceInEther * ethPrice;
        
        let tokenTxs;
        try {
            const response = await axios.get(
                `https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&apikey=${etherscanApiKey}`,
                { timeout: 5000 }
            );
            
            if (response.data.status !== '1') {
                throw new Error(`Etherscan API error: ${response.data.message}`);
            }
            
            tokenTxs = response.data.result;
        } catch (error) {
            console.error('Failed to fetch token transactions:', error);
            throw error;
        }
        
        const uniqueTokens = [...new Set(tokenTxs.map(tx => tx.contractAddress))];
        console.log(`Found ${uniqueTokens.length} unique tokens`);
        
        let totalValue = ethValue;
        const holdings = [{
            symbol: 'ETH',
            balance: ethBalanceInEther,
            usdValue: ethValue
        }];
        
        for (const tokenAddress of uniqueTokens) {
            try {
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                
                const [balance, decimals, symbol] = await Promise.all([
                    tokenContract.balanceOf(walletAddress),
                    tokenContract.decimals(),
                    tokenContract.symbol()
                ]);
                
                if (balance > 0n) {
                    const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, decimals));
                    
                    await sleep(1000);
                    try {
                        const priceResponse = await axios.get(
                            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`,
                            { timeout: 5000 }
                        );
                        
                        const tokenPrice = priceResponse.data[tokenAddress.toLowerCase()]?.usd || 0;
                        const usdValue = formattedBalance * tokenPrice;
                        
                        if (usdValue > 0) {
                            holdings.push({
                                symbol,
                                balance: formattedBalance,
                                usdValue
                            });
                            totalValue += usdValue;
                            console.log(`Added ${symbol}: ${formattedBalance} ($${usdValue.toFixed(2)})`);
                        }
                    } catch (error) {
                        console.log(`Skipping price fetch for ${symbol}: ${error.message}`);
                    }
                }
                
                await sleep(200);
                
            } catch (error) {
                console.log(`Skipping token ${tokenAddress}: ${error.message}`);
                continue;
            }
        }
        
        return {
            totalNetWorthUSD: totalValue,
            holdings: holdings.sort((a, b) => b.usdValue - a.usdValue)
        };
        
    } catch (error) {
        console.error('Error in getWalletNetWorth:', error);
        throw error;
    }
}
