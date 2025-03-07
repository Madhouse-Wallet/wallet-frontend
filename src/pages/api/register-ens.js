import { namehash } from "@ethersproject/hash";
import { ethers } from "ethers";
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";

const baseRegistrarAbi = [
  "function register(tuple(string name, address owner, uint duration, address resolver, bytes[] data, bool reverseRecord)) external payable returns (uint256)",
  "function reclaim(uint256 id, address owner) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function setAddr(bytes32 node, address a) external",
  "function setName(string name) external",
  "function rentPrice(string name, uint256 duration) public view returns (tuple(uint256 base, uint256 premium))",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("line-20");
    const {
      defApiKey,
      defApiSecret,
      name,
      duration = 31557600, // 1 year default
      smartAccount,
      registrarControllerAddress,
      resolverAddress,
      reverseRegistrarAddress,
      baseRegistrarAddress,
    } = req.body;
    console.log("line-31", req.body);
    // Validate required fields
    if (
      !defApiKey ||
      !defApiSecret ||
      !name ||
      !smartAccount ||
      !registrarControllerAddress ||
      !resolverAddress ||
      !reverseRegistrarAddress ||
      !baseRegistrarAddress
    ) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Create provider and signer
    const credentials = {
      apiKey: defApiKey,
      apiSecret: defApiSecret,
    };

    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, {
      speed: "fast",
    });

    // Create contract instances
    const Registrar = new ethers.Contract(
      registrarControllerAddress,
      baseRegistrarAbi,
      signer
    );
    const resolver = new ethers.Contract(
      resolverAddress,
      baseRegistrarAbi,
      signer
    );
    const reverseRegistrar = new ethers.Contract(
      reverseRegistrarAddress,
      baseRegistrarAbi,
      signer
    );
    const baseRegistrar = new ethers.Contract(
      baseRegistrarAddress,
      baseRegistrarAbi,
      signer
    );

    // Get ENS node
    const node = namehash(`${name}.base.eth`);

    // Step 1: Get rent price
    const rentPrice = await Registrar.rentPrice(name, duration);
    const totalRentPrice = rentPrice.base.add(rentPrice.premium);
    const ensfee = rentPrice.base ;


    // Step 2: Register name
    const setAddrSelector = "0xd5fa2b00";
    const setNameSelector = "0x77372213";

    const ensName = `${name}.base.eth`;
    const nameHash = namehash(ensName);
    const signerAddress = await signer.getAddress();

    // Encode setAddr function calldata
    const setAddrData =
      setAddrSelector +
      nameHash.substring(2) +
      "000000000000000000000000" +
      signerAddress.substring(2);

    const nameBytes = ethers.utils.toUtf8Bytes(ensName);
    const nameLength = nameBytes.length.toString(16).padStart(64, "0");
    const nameHex = ethers.utils
      .hexlify(nameBytes)
      .substring(2)
      .padEnd(64, "0");

    const setNameData =
      setNameSelector +
      nameHash.substring(2) +
      "0000000000000000000000000000000000000000000000000000000000000040" +
      nameLength +
      nameHex;

    const encodedData = [setAddrData, setNameData].map(ethers.utils.arrayify);
    console.log("line-86", encodedData);
    const registerTx = await Registrar.register(
      {
        name,
        owner: signerAddress,
        duration,
        resolver: resolverAddress,
        data: encodedData,
        reverseRecord: true,
      },
      { value: ensfee }
    );

    const receipt = await registerTx.wait();

    // Extract NFT ID from logs
    let nftId;
    if (receipt.logs.length > 1 && receipt.logs[1].topics.length > 3) {
      const log = receipt.logs[1];
      const topic4 = log.topics[3];
      nftId = BigInt(topic4).toString();
    } else {
      throw new Error("Transaction logs do not contain enough data");
    }

    // Step 3: Set Address in Resolver
    const setAddrTx = await resolver.setAddr(node, smartAccount);
    await setAddrTx.wait();

    // Step 4: Set Reverse Record
    const setNameTx = await reverseRegistrar.setName("");
    await setNameTx.wait();

    // Step 5: Reclaim Ownership
    const reclaimTx = await baseRegistrar.reclaim(nftId, smartAccount);
    await reclaimTx.wait();

    // Step 6: Transfer NFT to Smart Account
    const transferTx = await baseRegistrar[
      "safeTransferFrom(address,address,uint256)"
    ](signerAddress, smartAccount, nftId);
    await transferTx.wait();

    return res.status(201).json({
      status: "success",
      message: "ENS name registered successfully",
      data: {
        name: ensName,
        tokenId: nftId,
        owner: smartAccount,
        transactionHash: receipt.transactionHash,
      },
    });
  } catch (error) {
    console.error("Error registering ENS name:", error);
    return res.status(500).json({
      status: "error",
      error: error?.message || "Internal server error",
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "3mb",
    },
  },
};
