import axios from "axios";
import { randomBytes, createHash } from "crypto";
const bitcoin = require("bitcoinjs-lib");
const secp = require("@bitcoinerlab/secp256k1");
const ecfactory = require("ecpair");
const ECPair = ecfactory.ECPairFactory(secp);

// Endpoint of the Boltz instance to be used
const endpoint = 'https://api.boltz.exchange';

// Amount you want to swap
// const invoiceAmount = 135;

const sha256 = (buffer: Buffer) => createHash("sha256").update(buffer).digest();
//'L-BTC'
export const reverseSwap = async (invoiceAmount:any, type: any) => {
    try {
         // Create a random preimage (32 bytes)
  const preimage = randomBytes(32);

  // Generate a keypair
  const keys = ECPair.makeRandom();

  // Create a Reverse Swap
  const createdResponse = (
    await axios.post(`${endpoint}/v2/swap/reverse`, {
      invoiceAmount,
      to: type,
      from: 'BTC',
      claimPublicKey: keys.publicKey.toString('hex'),
      preimageHash: sha256(preimage).toString('hex'),
    })
  ).data;

  // console.log('Created swap');
  // console.log(createdResponse);
  return createdResponse;
    } catch (error) {
        console.log("error-->",error)
        return false
    }
 
};

// (async () => {
//   await reverseSwap();
// })();
