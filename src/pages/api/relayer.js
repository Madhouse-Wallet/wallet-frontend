import client from '../../lib/mongodb'; // Import the MongoDB client
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers';
const ensABI = [
    "function setApprovalForAll(address operator, bool approved) external",
    "function isApprovedForAll(address account, address operator) external view returns (bool)"
];
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { address, defApiKey, defApiSecret,  userAddress } = req.body;
        console.log("address, defApiKey, defApiSecret,  userAddress",address, defApiKey, defApiSecret,  userAddress)
        // Create Defender Relay Signer
        const credentials = { 
            apiKey: defApiKey,
            apiSecret: defApiSecret 
        };
        const provider = new DefenderRelayProvider(credentials);
        const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
        // Create ENS contract instance
        const ensContract = new ethers.Contract(address, ensABI, signer);
        // Get relayer address
        const relayerAddress = await signer.getAddress();
        console.log(`Relayer Address: ${relayerAddress}`);
        // Check current approval status
        const isCurrentlyApproved = await ensContract.isApprovedForAll(relayerAddress, userAddress);
        console.log(`Current approval status: ${isCurrentlyApproved}`);
        // Only send transaction if not already approved
        if (!isCurrentlyApproved) {
            console.log(`Approving ${userAddress} to manage subdomains...`);
            const tx = await ensContract.setApprovalForAll(userAddress, true);
            
            // Wait for transaction confirmation
            const receipt = await provider.waitForTransaction(tx.hash);
            console.log(`Approval TX: ${tx.hash}`);
            return res.status(201).json({ status: "success", message: 'User Approved successfully' });
        }else{
            return res.status(201).json({ status: "success", message: 'User Approved successfully' });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        return res.status(500).json({ error: (error?.message || 'Internal server error') });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '3mb',
        },
    },
};
