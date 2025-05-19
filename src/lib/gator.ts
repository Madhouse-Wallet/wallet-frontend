import {
  type Call,
  createCaveatBuilder,
  createDelegation,
  Implementation,
  type MetaMaskSmartAccount,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { toHex, zeroAddress } from "viem";
import { randomBytes } from "crypto";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export const createSalt = () => toHex(randomBytes(8));

/**
 * Redeem the delegation, executing a zero value Call to the zero address. If
 * the Delegator is not deployed, a Call will be inserted to deploy the account
 * before redeeming the delegation.
 */

export const initAccount = async (
    paymasterClient: any,
    publicClient: any,
    bundlerClient: any,
    delegatorAccount: MetaMaskSmartAccount<Implementation>
) => {

        const { factory, factoryData } = await delegatorAccount.getFactoryArgs();

        const delegatorFactoryArgs =
            factory && factoryData ? { factory, factoryData } : undefined;


  // These caveats are allowing only a transfer of 0 ether to the zero address.
  const caveats = createCaveatBuilder(delegatorAccount.environment)
    .addCaveat("allowedTargets", [zeroAddress])
    .addCaveat("valueLte", 0n);

        const privateKey = generatePrivateKey(); 
        const account = privateKeyToAccount(privateKey);

        const redeemerAccount = await toMetaMaskSmartAccount({
            client: publicClient,
            implementation: Implementation.Hybrid,
            deployParams: [account.address, [], [], []],
            deploySalt: "0x",
            signatory: { account },
            });

        const delegation = createDelegation({
                to: redeemerAccount.address,
                from: delegatorAccount.address,
                caveats
        });
        await delegatorAccount.signDelegation({ delegation });

        const calls: Call[] = [];
        /*
         The delegate is submitting the user operation, so may be deployed via initcode. If the delegator
         is not yet on-chain, it must be deployed before redeeming the delegation. If factory
         args are provided, an additional call is inserted into the calls array that is encoded
         for the user operation.
        */
        if (delegatorFactoryArgs) {
            const { factory, factoryData } = delegatorFactoryArgs;

            calls.unshift({
            to: factory,
            data: factoryData,
            });
        }

        const { fast } = await bundlerClient.getUserOperationGasPrice();

        const userOperationHash = await bundlerClient.sendUserOperation({
            account: redeemerAccount,
            paymaster: paymasterClient, 
            calls,
            ...fast,
        });

  return await bundlerClient.waitForUserOperationReceipt({
    hash: userOperationHash,
  });
};